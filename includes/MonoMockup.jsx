function MonoMockup (initDoc) 
{
    var csroot = Folder($.getenv("csroot"));
    this.templates = {
        bags : {            
            file: File(csroot.fullName + '/produktion/druckvorstufe/scriptVorlagen/ansicht/taschen/Ansicht_Taschen_Master.indd'),
            scale : 4.5
        },
        shirts : {
            file : File(csroot.fullName + '/produktion/druckvorstufe/scriptVorlagen/ansicht/shirts/Ansicht_Shirt_Master.indd'),
            scale : 6.5
        }
    };
    this.doc;
    this.type;
    this.scale;
    this.masterPages = {};
    this.layers = {};

    if(initDoc && initDoc.constructor.name == 'Document') this.init(initDoc);
};

MonoMockup.prototype.typeahead = new Typeahead();
MonoMockup.prototype.texTool = new TexAdder();

MonoMockup.prototype.import_pages = function () 
{

    var templateFile = this.get_scale() > 5 ? this.templates.shirts.file : this.templates.bags.file;        
    this.templateDoc = app.open(templateFile, false);
    
    this.label_pages(this.templateDoc);
    
    //var typeahead = new Typeahead();
    var selectedPages = this.typeahead.show_dialog(this.templateDoc.pages, 'label');

    //var selectedPages = this.select_textile_pages(this.templateDoc);
    this.copy_spreads(this.templateDoc, this.doc, selectedPages);
    this.templateDoc.close();

    return this;
};

MonoMockup.prototype.create_mockupDoc = function () 
{
    var templateFiles = this.typeahead.show_dialog([this.templates.bags.file, this.templates.shirts.file], 'displayName');   
    
    this.templateDoc = templateFiles[0] ? app.open(templateFiles[0]) : null;
    if(!this.templateDoc)return;

    //create doc preset based on the chosen template document
    var newDocPreset = this.createDocPresetFromMaster();
    
    // create new doc with this docPreset Object (will be the final mockup doc)
    this.doc = app.documents.add(true, newDocPreset, {});
    this.doc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;


    // copy styles, layers and masterpages from template file to mockup doc
    this.copyStyles(this.templateDoc, this.doc);
    this.copyLayers(this.templateDoc, this.doc);
    this.copyMasterPages(this.templateDoc, this.doc);

    return this;
};

MonoMockup.prototype.createDocPresetFromMaster = function ()
{
    //Creates a document preset based on the current document settings.

    if(app.documents.length > 0){
        var myDoc = app.documents.item(0); 
        var myDPreset = app.documentPresets.item("MockupMasterPreset");
        
        try {var myPresetName = myDPreset.name}
        catch (myError){myDPreset = app.documentPresets.add({name:"MockupMasterPreset"})};

        app.viewPreferences.horizontalMeasurementUnits
            = myDoc.viewPreferences.horizontalMeasurementUnits;
        app.viewPreferences.verticalMeasurementUnits
            = myDoc.viewPreferences.verticalMeasurementUnits;

        var myDPrefs = myDoc.documentPreferences;
        var myMPrefs = app.activeDocument.marginPreferences;

        myDPreset.left = myMPrefs.left;
        myDPreset.right = myMPrefs.right;
        myDPreset.top = myMPrefs.top;
        myDPreset.bottom = myMPrefs.bottom;
        myDPreset.columnCount = myMPrefs.columnCount;
        myDPreset.columnGutter = myMPrefs.columnGutter;
        myDPreset.documentBleedBottomOffset = myDPrefs.documentBleedBottomOffset;
        myDPreset.documentBleedTopOffset = myDPrefs.documentBleedTopOffset;
        myDPreset.documentBleedInsideOrLeftOffset = myDPrefs.documentBleedInsideOrLeftOffset;
        myDPreset.documentBleedOutsideOrRightOffset = myDPrefs.documentBleedOutsideOrRightOffset;
        myDPreset.facingPages = myDPrefs.facingPages;
        myDPreset.pageHeight = myDPrefs.pageHeight;
        myDPreset.pageWidth = myDPrefs.pageWidth;
        myDPreset.pageOrientation = myDPrefs.pageOrientation;
        myDPreset.pagesPerDocument = 1;
        myDPreset.slugBottomOffset = myDPrefs.slugBottomOffset;
        myDPreset.slugTopOffset = myDPrefs.slugTopOffset;
        myDPreset.slugInsideOrLeftOffset = myDPrefs.slugInsideOrLeftOffset;
        myDPreset.slugRightOrOutsideOffset = myDPrefs.slugRightOrOutsideOffset;
    };
    return myDPreset;
};

MonoMockup.prototype.check_create_layer = function (layerName)
{
    try {
        var l = this.doc.layers.itemByName(layerName);
        var check = l.name;
    } catch (e) {
        var l = this.doc.layers.add({name: layerName});
    }
    return l;
};

MonoMockup.prototype.init = function (doc) 
{
    if(!this.doc && app.documents.length > 0) this.doc = app.activeDocument;
    
    with (this.doc.viewPreferences){
        horizontalMeasurementUnits = MeasurementUnits.millimeters;
        verticalMeasurementUnits = MeasurementUnits.millimeters;
        rulerOrigin = RulerOrigin.pageOrigin;
    }

    this.scale = this.get_scale();
    this.type = this.scale > 5 ? 'shirts' : 'bags';

    with (this.doc.textDefaults) {
        appliedFont = app.fonts.item('Myriad Pro');
        justification = Justification.LEFT_ALIGN;
        pointSize = 11.5*this.scale;
        leading = 11.5*this.scale;
        hyphenation = false;
    }

    this.masterPages.fixed  = this.doc.masterSpreads.item('A-FixedStuff');
    this.masterPages.guides  = this.doc.masterSpreads.item('B-Hilfslinien');
    this.masterPages.preview = this.doc.masterSpreads.item('C-Preview');

    // set layers
    this.layers.hl       = this.check_create_layer('HL');
    this.layers.intern   = this.check_create_layer('Intern');
    this.layers.shop     = this.check_create_layer('Shop');
    this.layers.textils  = this.check_create_layer('Textils');
    this.layers.prints   = this.check_create_layer('Prints');
    this.layers.infos    = this.check_create_layer('Infos');
    this.layers.fixed    = this.check_create_layer('Fixed');
    
    this.doc.activeLayer = this.layers.prints;
    
    return this;
};

MonoMockup.prototype.choose_textil_color = function (myPage) 
{
    var fixedLayers = /(Shirt|Front|Back|Naht)/i;

    this.doc.layoutWindows.item(0).activePage = myPage;
    this.texTool.choose_graphicLayers (this.layers.textils.allGraphics);

};

MonoMockup.prototype.get_scale = function ()
{
    var docwidth = this.doc.documentPreferences.pageWidth;
    return (docwidth / 297);
};

MonoMockup.prototype.show_shop_logo = function (shop) 
{
    var myDoc = app.activeDocument,
        fixedMaster = myDoc.masterSpreads.item('A-FixedStuff');

    if (shop == 'wme') {
        var logo = fixedMaster.pageItems.item('wmeLogo');
        logo.visible = true;
        logo = fixedMaster.pageItems.item('csLogo');
        logo.visible = false;
    } else {
        var logo = fixedMaster.pageItems.item('csLogo');
        logo.visible = true;
        logo = fixedMaster.pageItems.item('wmeLogo');
        logo.visible = false;            
    }
};

MonoMockup.prototype.fill_job_infos = function (nfo)
{
    var jobFrameBounds = this.masterPages.fixed.pageItems.item('mJobFrame').geometricBounds;


    try{
        var tf = this.masterPages.fixed.textFrames.item('jobFrame');
        var check = tf.name;
    } catch (e) {
        var tf = this.masterPages.fixed.textFrames.add({
            itemLayer: this.layers.infos,
            geometricBounds:jobFrameBounds,
            name: 'jobFrame'});
    }


    var fixS = this.doc.paragraphStyles.item("fixedTextStyle");
    var variS = this.doc.paragraphStyles.item("variableTextStyle");
    var jobS = this.doc.paragraphStyles.item("jobTextStyle");
    var jobString;

    if(!nfo) {
        var nfo = {
            client : 'Max Musterman',
            jobNr : '0000A17-014',
            refNr : '---',
            design : '---'
        };
    }
    
    jobString = 'Auftraggeber:\r';
    jobString += nfo.client;
    jobString += '\rAuftragsnummer:\r';
    jobString += nfo.jobNr;
    jobString += '\rAuftragsname:\r';
    jobString += nfo.jobName;
    jobString += '\rReferenz:\r';
    jobString += nfo.jobNr != nfo.refNr ? nfo.refNr : '---';        

    tf.contents = jobString;
    var j, maxJ = tf.parentStory.paragraphs.length, pg;
    for (j = 0; j < maxJ; j += 1) {
        pg = tf.parentStory.paragraphs[j];
        if(j % 2 == 0) {
            pg.applyParagraphStyle(fixS, true);
        } else {
            pg.applyParagraphStyle(variS, true);
        }
    }

    // fill the intern jobNr textframe
    var intern_job_frame = this.masterPages.fixed.pageItems.item('jobNr_kuerzel');
    jobString = nfo.client;
    jobString +=' - ';
    jobString += nfo.jobNr;        
    if(nfo.jobNr != nfo.refNr) {
        jobString += '\nND ';
        jobString += nfo.refNr;
    }
    jobString += ' - ';
    jobString += this.get_kuerzel();

    intern_job_frame.contents = jobString;
    intern_job_frame.paragraphs.item(0).applyParagraphStyle(jobS);
};

MonoMockup.prototype.get_kuerzel = function () 
{
    var username = $.getenv('USERNAME');
    
    if(username.indexOf('.') > 0) {
        // if username contains . make kuerzel from username jan.untiedt -> JU
        return (username.split('.')[0][0] + username.split('.')[1][0]).toUpperCase();        
    } else {
        return username;
    }
}

MonoMockup.prototype.label_pages = function (templateDoc) 
{
    var i, maxI, myPage, pageGraphics, textilName, j, maxJ;

    // go through all pages
    for(i = 0, maxI = templateDoc.pages.length; i < maxI; i += 1) {
        myPage = templateDoc.pages[i];

        //go through graphics on page
        if(myPage.allGraphics && myPage.allGraphics.length > 0) {
            pageGraphics = myPage.allGraphics;
            for(j = 0, maxJ = pageGraphics.length; j < maxJ; j += 1) {
                //if graphic is on textil-layer
                if(pageGraphics[j].itemLayer === templateDoc.layers.item('Textils')) {
                    textilName = pageGraphics[j].itemLink.name;
                    textilName = textilName.substring(0, textilName.lastIndexOf('.'));
                    break;
                }
            }
        } else {
            textilName = 'leere Vorlage';
        }

        myPage.label = textilName;
    }
};

MonoMockup.prototype.get_pageRefs = function (templateDoc, namesArray) 
{
    var i, maxI, pageName, j, maxJ, myPage,
        myTexPages = [];

    for(i = 0, maxI = namesArray.length; i < maxI; i += 1) {
        pageName = namesArray[i];
        for(j = 0, maxJ = templateDoc.pages.length; j < maxJ; j+=1) {
            myPage = templateDoc.pages[j];
            if(myPage.label == pageName) {
                myTexPages.push(myPage);
            }
        }
    }
    return myTexPages;
};

MonoMockup.prototype.select_textile_pages = function (templateDoc) 
{
    var win, myPage, i, maxI,
        pageNames = [];

    win = new Window('dialog', 'Textilien wählen:');
    win.spacing = 3;
    
    for (i = 0, maxI = templateDoc.pages.length; i < maxI; i+=1) {
        myPage = templateDoc.pages[i];
        if(myPage.label != 'StyleTester') {
            win[i] = win.add("checkbox", [10, 10, 150, 35], myPage.label);
            win[i].value = false;
        }
    };

    win.okButton = win.add("button", [10, 10 ,150, 35], 'Ok');
        win.okButton.onClick = function() {
            var box,
                k,
                maxK;

            for (k = 0, maxK = win.children.length; k < maxK; k += 1) {
                box = win.children[k];
                if (box.value === true) {
                    pageNames.push(box.text);
                };
            };

            win.close();
        };

    win.show();

    pageNames.sort();
    
    return this.get_pageRefs(templateDoc, pageNames);
};

MonoMockup.prototype.copy_spreads = function (sourceDoc,destDoc, pages2copy) 
{
    var dupedSpreads = [];

    for (var i = 0, maxI = pages2copy.length; i < maxI; i += 1) {
        var myPage = pages2copy[i];
        var dupedSpread = myPage.duplicate(LocationOptions.AFTER, destDoc.pages.lastItem());
        this.choose_textil_color(dupedSpread);
        dupedSpreads.push(dupedSpread);
    }
    
    try {
        var defaultSpread = destDoc.masterSpreads.item('A-Musterseite');
        defaultSpread.remove();
    } catch (e) {
        $.writeln(e)
    };

    if(destDoc.pages.item(0).pageItems.length == 0) {
        destDoc.pages.item(0).remove();
    }

    return dupedSpreads;
};

MonoMockup.prototype.place_prints_on_page = function (monoPrints) 
{
    
    var mN = new MonoNamer();

    var myDoc = this.doc;
    var printLayer = this.layers.prints;
    var myPage = app.activeWindow.activePage;

    // loop through the array of prints to place on the activepage
    for (var j = 0; j < monoPrints.length; j++) 
    {
        var mP = monoPrints[j];
        if(mP.film) {
            var monoFilm = new MonoFilm(mP.film);
            var sepPos = monoFilm.get_sepPos();
            monoFilm.filmDoc.close(SaveOptions.no);
        }

        var side = mN.name_side(mP.id);
        
        if(side == 'Back') {
            var xRef = myPage.guides.item('midlineBack');
            var x = xRef.location;
            var hLine = myPage.graphicLines.item('necklineBack');
        } else {
            var xRef = myPage.guides.item('midlineFront');
            var x = xRef.location;                    
            var hLine = myPage.graphicLines.item('necklineFront');
        }
        var y = (hLine.geometricBounds[0] + hLine.geometricBounds[2]) / 2;

        // if there is no preview file, use the druckfile for placing in the mockup instead
        var fileToPlace = mP.preview ? mP.preview : mP.print;
        var placedImages = myPage.place(fileToPlace, undefined, printLayer);
        var image = placedImages[0];
        
        // if there are films, position the graphic according to the sep position on the films
        if(sepPos) {
            var myPosition = [x+sepPos.deltaX, y + sepPos.deltaY];
            image.parent.move(myPosition);
        } else {
            // center graphic on x guide
            var l = image.parent.geometricBounds[1];
            var r = image.parent.geometricBounds[3];
            var myPosition = [x-(r-l)/2,y+80];
            image.parent.move(myPosition);                
        }
        
        // if the bag is printed on both sides
        // duplicate the print and copy it to the backside of the bag
        // and position it exactly like on the frontside
        if(mP.id == 'BeutelAA')
        {                
            x = myPage.guides.item('midlineBack').location;
            hLine = myPage.graphicLines.item('necklineBack');
            y = (hLine.geometricBounds[0] + hLine.geometricBounds[2]) / 2;

            myPosition = [x+sepPos.deltaX, y + sepPos.deltaY];
            var rec = image.parent;
            rec.duplicate(myPosition);
        }
    }
};

MonoMockup.prototype.getPrints = function (jobFolder, tech)
{
    var dd
    var ddFolders = tech ? jobFolder.getFiles('Druckdaten-'+ tech) : jobFolder.getFiles(/Druckdaten-(SD|DTA|DTG|SUB|FLX|FLK|STK)/i);
    var pO = {
            tag : null,
            nfo : null,
            druck : null,
            preview : null,
            film : null
        };

    var i, maxI = ddFolders.length, ddfldr, dFiles, pOs = [];
    for(i=0;i<maxI;i+=1)
    {
        ddfldr=ddFolders[i];
        dFiles = ddfldr.getFiles(rE.print);
        
        var j, maxJ = dFiles.length, dFile, myPO;
        for(j=0;j<maxJ;j+=1)
        {
            dFile = dFiles[j];
            myPO = Object.create(pO);
            myPO.tag = rE.printTag.exec(dFile.displayName)[0];
            myPO.nfo = job.get_nfo_from_filename(dFile);
            myPO.druck = dFile;
            myPO.preview = mofo.folder('previews').getFiles(myPO.tag + '_Preview.*')[0];
            myPO.film = mofo.folder('ddSD').getFiles('*'+ myPO.nfo.printId +'_'+ myPO.nfo.wxh +'_'+ myPO.nfo.tech +'_Film.indd')[0];
            myPO.film ? myPO.filmInfos = this.getFilmInfo(myPO.film) : myPO.filmInfos = '';
            pOs.push(myPO);
        }
    }
    return pOs;
};

MonoMockup.prototype.getFilmInfo = function (filmFile)
{

    function make_spaces_unbreakable(str) {
        var nbStr = str.replace(/\s/g, '\xa0');
        return nbStr;
    }

    var doc = app.open(filmFile, false),
        vPrefs = doc.viewPreferences,
        oldXUnits,
        oldYUnits,    
        sepInfo = {
            spotsArray : []
        };

    oldXUnits = vPrefs.horizontalMeasurementUnits,
    oldYUnits = vPrefs.verticalMeasurementUnits,            
    vPrefs.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
    vPrefs.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
    
    var vLine = doc.guides.item('vLine'),
        hLine = doc.guides.item('hLine'),            
        sep = doc.layers.item('motivEbene').allGraphics[0],
        sepBounds = sep.geometricBounds;

    var i,maxI,spot;
    for (i = 4, maxI = doc.swatches.length; i < maxI; i += 1)  {
        spot = doc.swatches[i];
        if ((spot.model === ColorModel.SPOT) && (spot.name != 'Registration')) {
            sepInfo.spotsArray.push(make_spaces_unbreakable(spot.name));
        };
    };

    sepInfo.xDist = sepBounds[1] - vLine.location;
    sepInfo.yDist = sepBounds[0] - hLine.location;
    sepInfo.x2Dist = sepBounds[3] - vLine.location;
    sepInfo.y2Dist = sepBounds[2] - hLine.location;
    sepInfo.width = sepBounds[3] - sepBounds[1];
    sepInfo.height = sepBounds[2] - sepBounds[0];

    vPrefs.horizontalMeasurementUnits = oldXUnits;
    vPrefs.verticalMeasurementUnits = oldYUnits;
  
    doc.close(SaveOptions.no);                

    return sepInfo
};

MonoMockup.prototype.update_size_and_stand = function (myPage, myGraphics)
{
    var myDoc = myPage.parent.parent;
    var infoLayer = myDoc.layers.item('Infos');
    try {
        tF = myPage.textFrames.item('printTableFrame');
        var check = tF.name
    } catch (e) {
        alert('No Table found, use createTable instead');
    }

    var tbl = tF.tables.item(0);
    for(var i = 0, maxI = tbl.columns.length; i < maxI; i += 1) {
        var col = tbl.columns[i];
        if (col.contents[0] === 'Druckstand:') {
            var standIdx = i;
            break;
        }
    }

    var i,
        maxI,
        myGraphic,
        myRow,
        sizeCell,
        standCell,
        oldStand,
        oldString,
        newStand,
        newString;

    for (i = 0, maxI = myGraphics.length; i < maxI; i+= 1) {
        myGraphic = myGraphics[i];
        newStand = myGraphic.get_stand();            
        //myRow = tbl.rows.item(i+1);
        myRow = tbl.rows.item(myGraphic.get_order()+1);

        sizeCell = myRow.cells.item(standIdx-1);
        sizeCell.contents = myGraphic.get_width();

        standCell = myRow.cells.item(standIdx);
        oldString = standCell.contents.split(/\d{1,2}(\.5|,5)?/)[2];

        newString = 'ca. ';
        if(newStand > 0) {
            newString += newStand;
            newString += oldString.replace('über', 'unter');
        } else if(newStand < 0) {
            newString += newStand*-1;                
            newString += oldString.replace('unter', 'über');
        }
        
        standCell.contents = newString;
    }
};

MonoMockup.prototype.create_table = function (myPage)
{
    function resize_column(myColumn, newWidth) 
    {
        var myTable = myColumn.parent;
        var deltaW = myColumn.width - newWidth;
        myColumn.width = newWidth;
        
        var getIndex = function (myColumn) 
        {
            var i, maxI;
            for (i = 0, maxI = myColumn.parent.columns.length; i < maxI; i+=1) 
            {
                if(myTable.columns.item(i) === myColumn) {
                    return i
                };
            };
        };

        var index = getIndex(myColumn);

        var i, maxI, otherColumn;
        for (i = index+1, maxI = myTable.columns.length; i < maxI ; i+=1) 
        {
            otherColumn = myTable.columns.item(i);
            otherColumn.width += deltaW/(myTable.columns.length - 1 - index);
        };
    }

    var infoLayer = myDoc.layers.item('Infos');
    //var textil = get_textil_nfo_from_user();
    var textil = {name: 'Textil', farbe:'Farbe', run: 'XX'};
    var tableString = 'Menge:\tArtikel:\tFarbe(n):\tPosition:\tBreite (mm):\tDruckstand:\tVerfahren:\tDruckfarben:\rx\tx\tx\tx\tx\tx\tx\tx\r';

    try {
        myTF = myPage.textFrames.item('printTableFrame');
        var check = myTF.name;
    } catch (e) {
        var tFBounds = myDoc.masterSpreads.item('A-FixedStuff').pageItems.item('printTabFrame').geometricBounds;
        var myTF = myPage.textFrames.add({geometricBounds:tFBounds, itemLayer:infoLayer, name: 'printTableFrame'});
        myTF.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
    }
    
    while(myTF.tables.length > 0) {
        myTF.tables.item(0).remove();
    }
            
    myTF.contents = tableString;
    myTF.texts.item(0).convertToTable();
    var myTable = myTF.tables.item(0);
    myTable.name = 'filmInfosTable';
    
    var headerRow = myTable.rows.item(0);
    headerRow.rowType = RowTypes.HEADER_ROW;
    headerRow.cells.everyItem().appliedCellStyle = myDoc.cellStyles.item('headerCellStyle');

    myTable.appliedTableStyle = myDoc.tableStyles.item('defaultTStyle');        
    myTable.alternatingFills = AlternatingFillsTypes.ALTERNATING_ROWS;
    
    // adjust with of columsn according to Beutel oder Shirt Ansicht
    // total width is 287
    var scale = this.getScale();
    switch (scale) {
        case 4.5 : widthArr = [20, 25, 35, 35, 25, 53, 35, 60];
        break;
        case 6.5 : widthArr = [18.5, undefined, 33, 27, 31, undefined, 35, undefined];
        break;
        default :  widthArr = [18.5, undefined, 33, 27, 31, undefined, 35, undefined];
    }
    for(var i = 0; i < widthArr.length; i++) {
        if(widthArr[i] != undefined) {
            resize_column(headerRow.columns.item(i), widthArr[i]*scale);    
        }            
    }

    var myRow = myTable.rows.item(1);

    myRow.cells.everyItem().appliedCellStyle = myDoc.cellStyles.item('defaultCellStyle');
    myRow.cells.everyItem().autoGrow = true;

    // var runCell = myRow.cells.item(0);
    // runCell.contents = textil.run;

    // var textilCell = myRow.cells.item(1);
    // textilCell.contents = textil.name;

    // var textilFarbeCell = myRow.cells.item(2);
    // textilFarbeCell.contents = textil.farbe;

    return myTable;
};

MonoMockup.prototype.add_preview_page = function () 
{

    var page = this.doc.pages.add(LocationOptions.AT_END, {appliedMaster: this.masterPages.preview});

    var margPref = page.marginPreferences;
    var previewFrameStyle = this.doc.objectStyles.item('previewFrameStyle');
    var y1 = 0;
    var x1 = 0;
    var y2 = page.bounds[2];
    var x2 = page.bounds[3];
    var recBounds = [y1,x1,y2,x2];
    var rec = page.rectangles.add(undefined, undefined, undefined, {geometricBounds:recBounds, contentType: ContentType.GRAPHIC_TYPE, appliedObjectStyle: previewFrameStyle});
    this.split_frame(rec);
};

MonoMockup.prototype.get_monoGraphics = function (myPage,myLayer)
{
    var myGraphics = [];
    for (var g = 0; g < myPage.allGraphics.length; g++) 
    {  
        var placedGraphic = myPage.allGraphics[g];
        if (placedGraphic.itemLayer === myLayer) {
            var myGraphic = new MonoGraphic(placedGraphic);
            myGraphics.push(myGraphic);
        }
    }
    
    myGraphics.sort(function(a,b) {
        var mN = new MonoNamer();
        return mN.name_side(a.side) - mN.name_side(b.side);
    });

    return myGraphics;
};

MonoMockup.prototype.write_graphic_infos_to_table = function (myTable, myGraphics) 
{
    function get_textil_nfo_from_user(myGraphic) {
        var result = {};
        
        var win = new Window('dialog', 'Textilangaben:');

        //win.textilPanel = win.add('panel', [0, 0, 400, 110], "verwendeter Artikel und Farbe(n):");
        win.textilPanel = win.add('panel', undefined, "verwendeter Artikel und Farbe(n):");

        win.textilPanel.textil      = win.textilPanel.add("edittext", [5, 10,  390, 35], myGraphic.get_textil_name(), { enterKeySignalsOnChange : true });
        win.textilPanel.color       = win.textilPanel.add("edittext", [5, 40,  390, 65], myGraphic.get_textil_color(), { enterKeySignalsOnChange : true });
        win.textilPanel.run         = win.textilPanel.add("edittext", [5, 70,  390, 95], 'XXX', { enterKeySignalsOnChange : true });
        win.textilPanel.beidseitig  = win.textilPanel.add("checkbox", [5, 100, 390, 125], 'Textil beidseitig bedrucken',{enabled:true});
        win.textilPanel.hinweis     = win.textilPanel.add("edittext", [5, 130, 390, 155], 'Hinweis für SD?', { enterKeySignalsOnChange : true });

        win.quitBtn = win.add('button', [120,275,200,295], 'Fertig');

        win.quitBtn.onClick = function() {
            result.name = win.textilPanel.textil.text;
            result.color = win.textilPanel.color.text;
            result.run = win.textilPanel.run.text;
            result.beidseitig = win.textilPanel.beidseitig.value;
            result.hinweis = win.textilPanel.hinweis.text != 'Hinweis für SD?' ? win.textilPanel.hinweis.text : null;                
            win.close();
        };

        win.show();
        return result
    }

    var i, maxI, myGraphic,
        textil,
        myRow,
        runCell,texCell,texColorCell,posCell,sizeCell,standCell,techCell,colorsCell,
        standString;

    for (i = 0, maxI = myGraphics.length; i < maxI; i+= 1) {
        myGraphic = myGraphics[i];
        
        if(i===0) {
            textil = get_textil_nfo_from_user(myGraphic);
        }
        else if(textil.beidseitig) {
            textil = {run:' ', name:' ', color:' '};
        }        
        else if(i>0 && myGraphic.get_textil_name() !== myGraphics[i-1].get_textil_name()){
            textil = get_textil_nfo_from_user(myGraphic);
        }
    
        if((i+2) > myTable.rows.length) {
            myRow = myTable.rows.add(LocationOptions.AT_END, myTable);
        } else {
            myRow = myTable.rows.item(i+1);
        }

        myRow.cells.everyItem().appliedCellStyle = myDoc.cellStyles.item('defaultCellStyle');
        myRow.cells.everyItem().autoGrow = true;
        
        runCell = myRow.cells.item(0);
        runCell.contents = textil.run || 'XX';

        texCell = myRow.cells.item(1);
        texCell.contents = textil.name || myGraphic.get_textil_name();

        texColorCell = myRow.cells.item(2);
        texColorCell.contents = textil.color || myGraphic.get_textil_color();

        posCell = myRow.cells.item(3);
        posCell.contents = myGraphic.get_nfo('printId') || myGraphic.side;

        sizeCell = myRow.cells.item(4);
        sizeCell.contents = myGraphic.get_width();

        standCell = myRow.cells.item(5);
        standString = 'ca. ';
        var stand = myGraphic.get_stand();            
        if(stand > 0) {
            standString += stand + ' cm unter der';
            standString += this.getScale() == 6.5 ? ' Kragennaht' : ' Taschenöffnung';
        } else if (stand < 0) {
            standString += (stand*-1) + ' cm über der Markierung';
        }
        
        standCell.contents = standString;

        techCell = myRow.cells.item(6);
        techCell.contents = myGraphic.get_nfo('tech') || 'Siebdruck';

        colorsCell = myRow.cells.item(7);
        colorsCell.appliedCellStyle = myDoc.cellStyles.item('defaultCellStyle');
        
        myGraphic.colors = myGraphic.get_colors();
        if(myGraphic.colors && myGraphic.colors.join) {
            colorsCell.contents = myGraphic.colors.join(', ');
        } else if (myGraphic.colors) {
            colorsCell.contents = myGraphic.colors;
        } else {
            colorsCell.contents = 'Folgt';
        }

        // keine 2 Spalte ausfüllen wenn Beutel beidseitig
        if(myGraphic.get_nfo('printId') == 'BeutelAA') {i+=1}

        if(i==0 && textil.hinweis) {
            this.create_hinweis_frame(textil.hinweis);
        }
        if(myGraphics.length == 1) {
            //myRow = myTable.rows.lastItem().remove();
            myTable.rows.lastItem().remove();
        }
    }
};

MonoMockup.prototype.read_tables = function (doc) 
{

    var infoLayer = doc.layers.item('Infos'),
        tableRows = [],
        headerContents = [],
        tab,
        myPage;

    for(var i = 0, maxI = doc.pages.length; i < maxI; i+=1)
    {  
        myPage = doc.pages.item(i);
        try{ 
            myTF = myPage.textFrames.item('printTableFrame');
            var check = myTF.name;
            if (myTF.tables.length > 0) {
                tab = myTF.tables.item(0)
            }
        } catch (e) {continue} //continue with next page if no printTableFrame is found


        //get contents of the header row
        var myRow,
            myCell,
            rowContents,
            maxCells = 0;
           
        for(var r = 0, maxR = tab.rows.length; r < maxR; r+=1) 
        {
            myRow = tab.rows.item(r);
            maxCells = myRow.cells.length > maxCells ? myRow.cells.length : maxCells;
            rowContents = [];
            
            //if the row contains less then 8 cells, fill the missing contents from the last added rowContents
            if(myRow.cells.length < maxCells) {
                var maxL = maxCells - myRow.cells.length;
                for(var l=0; l<maxL; l+=1){
                    rowContents.push(tableRows[tableRows.length-1][l]);
                }
            }

            for(var c = 0, maxC = myRow.cells.length; c < maxC; c += 1) {
                myCell = myRow.cells.item(c);           
                rowContents.push(myCell.contents)
            }

            //if its the first row, its the header of the table
            //then overwrite the first tableRows entry since its always the same on all pages
            if(r==0) {
                tableRows[r] = rowContents;
            } else {
                tableRows.push(rowContents);
            }
            
        }
    }
    return tableRows;
};

MonoMockup.prototype.generate_wawi_strings = function (rowContents)
{
    var resStrings = [],
        texString,
        wawiString,
        myRow,
        heads = rowContents[0];
    for(var i = 1, maxI = rowContents.length; i < maxI; i+=1)
    {               
        conts = rowContents[i];         
        
        texString  = conts[0];  // Stückzahl
        texString += 'x ';               
        texString += conts[1];  // Artikel
        texString += ' in ';
        texString += conts[2];  // Farben
        texString += ' - Druckposition: ';
        texString += conts[3];  // Druckposi

        wawiString  = 'Produktionsdetails --> ';
        wawiString += conts[6] == 'Siebdruck' ? 'Druckfarben (~ Pantone C): ' : 'Druckfarben: ';
        wawiString += conts[7];
        wawiString += ' - Druckbreite: ca. ';
        wawiString += conts[4]/10;
        wawiString += ' cm - Motiv: ';
        
        myRow = {
            tex : texString,
            wawi : wawiString
        }
    
        resStrings.push(myRow);
    }
    return resStrings;
};
MonoMockup.prototype.save = function () {
    if(app.activeDocument.saved === false) {
        if(pm.file('mockUpIndd').exists) {
            var newJob = Window.prompt('Ansicht existiert, bitte neu JobNr angeben (oder die Ansicht wird überschrieben)', job.nfo.jobNr);
            var newFile = new File(pm.file('mockUpIndd').path + '/' + pm.file('mockUpIndd').displayName.replace(rE.jobNr, newJob));
            f_all.saveFile(newFile, undefined, false);
        } else {
            f_all.saveFile(pm.file('mockUpIndd'), undefined, false);
        }
    }
};

MonoMockup.prototype.create_ui = function (rowObjs, job)
{
    var dialogName = "WaWi Infos nachtragen zu ->  ";
        dialogName += job ? job.nfo.jobNr + ' - ' + job.nfo.client : 'irgendeinem bekloppten Auftrag';
    
    var myDialog = app.dialogs.add({name:dialogName});
    with(myDialog){
        with(dialogColumns.add()){          
            for(var i = 0; i < rowObjs.length; i++){
                with(borderPanels.add()){                   
                    with(dialogRows.add()){
                        staticTexts.add({staticLabel:rowObjs[i].tex, minWidth:750, staticAlignment: StaticAlignmentOptions.LEFT_ALIGN});
                    }
                    with(dialogRows.add()){
                        var myTextEditField = textEditboxes.add({editContents:rowObjs[i].wawi, minWidth:750});
                    }                           
                }                       
            }
        }               
    }

    //Show the dialog box.
    var myResult = myDialog.show();
    //If the user clicked OK, display one message;
    //if they clicked Cancel, display a different message.
    //Remove the dialog box from memory.
    myDialog.destroy();
};

MonoMockup.prototype.create_wawi_string_dialog = function (rowObjs, job) 
{
    var result = null;
    var dialogTitle;
    dialogTitle = "WaWi Infos nachtragen zu ->  ";
    dialogTitle += job ? job.nfo.jobNr + ' - ' + job.nfo.client : 'irgendeinem bekloppten Auftrag';

    var win = new Window ('dialog', dialogTitle);
    win.alignChildren = 'fill';
        var aPnl;
        for(var i = 0; i < rowObjs.length; i++){
            aPnl = win.add('panel', undefined, '');
            aPnl.alignChildren = 'fill';
            aPnl.add('statictext', undefined, rowObjs[i].tex);
            aPnl.add('edittext', undefined, rowObjs[i].wawi);
        }
    
    win.add('button', undefined, 'Cancel');

    win.show();
};   

MonoMockup.prototype.create_hinweis_frame = function (hwStr) 
{
    var myPage = app.activeWindow.activePage,
        doc = myPage.parent.parent,
        internLayer = doc.layers.item('Intern');

    doc.activeLayer = internLayer;

    try {
        myTF = myPage.textFrames.item('hinweisFrame');
        var check = myTF.name;
    } catch (e) {
        var tFBounds = doc.masterSpreads.item('A-FixedStuff').pageItems.item('hinweisFrame').geometricBounds;
        var myTF = myPage.textFrames.add({geometricBounds:tFBounds, itemLayer:internLayer, name: 'hinweisFrame'});
        myTF.appliedObjectStyle = doc.objectStyles.item('hinweisFrameStyle');
    }
    myTF.contents = hwStr;
    myTF.paragraphs.item(0).applyParagraphStyle(doc.paragraphStyles.item('hinweisTextStyle'));
    return myTF;
};

MonoMockup.prototype.add_stand_listener = function (turnOn) 
{
    var doc = app.activeDocument;
    var myPage = app.activeWindow.activePage;
    var l = doc.layers.item('Infos');

    doc.removeEventListener("afterSelectionAttributeChanged", new File('/c/capri-links/scripts/includes/myStandListener.jsx'));
    if(turnOn) doc.addEventListener("afterSelectionAttributeChanged", new File('/c/capri-links/scripts/includes/myStandListener.jsx'));
};

MonoMockup.prototype.remove_stand_listener = function () 
{
    var doc = app.activeDocument;
    var myPage = app.activeWindow.activePage;
    var l = doc.layers.item('Infos');

    doc.removeEventListener("afterSelectionAttributeChanged", new File('/c/capri-links/scripts/includes/myStandListener.jsx'));                
};


MonoMockup.prototype.copyStyles = function (source, dest)
{
    dest.importStyles(ImportFormat.PARAGRAPH_STYLES_FORMAT, source.fullName);
    dest.importStyles(ImportFormat.CELL_STYLES_FORMAT, source.fullName);
    dest.importStyles(ImportFormat.TABLE_STYLES_FORMAT, source.fullName);
    dest.importStyles(ImportFormat.OBJECT_STYLES_FORMAT, source.fullName);
};

MonoMockup.prototype.copyLayers = function (source, dest)
{
    for(var i = 0, maxI = source.layers.length; i < maxI; i += 1) {
        var sourceLayer = source.layers[i],
            destLayer;
        try {
            destLayer = dest.layers.item(sourceLayer.name).name;
        } catch(e) {
            destLayer = dest.layers.add({name: sourceLayer.name});
            destLayer.move(LocationOptions.AT_END);
        };
    };
    dest.layers.item('Ebene 1').remove();
};

MonoMockup.prototype.copyMasterPages = function (sourceDoc,destDoc) 
{

    for (var i = 0, maxI = sourceDoc.masterSpreads.length; i < maxI; i += 1) {
        var mS = sourceDoc.masterSpreads[i];
        var dupedSpread = mS.duplicate(LocationOptions.AT_END, destDoc);
    };

    try {
        var defaultSpread = destDoc.masterSpreads.item('A-Musterseite');
        defaultSpread.remove();
    } catch (e) {
        $.writeln(e)
    };
};

MonoMockup.prototype.split_frame = function (myFrame) 
{
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    var page = myFrame.parentPage;
    var mrgPrf = page.marginPreferences;
    var myObjectList = new Array;
    if(myFrame) {
        myDisplayDialog([myFrame]);
    } else if (app.documents.length != 0) 
    {
        if(app.selection.length != 0){
            for(myCounter = 0; myCounter < app.selection.length; myCounter++){
                switch(app.selection[myCounter].constructor.name){
                    case "GraphicLine":
                    case "Oval":
                    case "Polygon":
                    case "Rectangle":
                    case "TextFrame":
                        myObjectList.push(app.selection[myCounter]);
                        break;          
                }
            }
            if(myObjectList.length !=0){
                myDisplayDialog(myObjectList);
            }
        }
    }
    function myDisplayDialog (myObjectList)
    {
        var myLabelWidth = 90;
        // var myFrameTypes = ["Unassigned", "Text", "Graphic"];
        var myDialog = app.dialogs.add({name:"Wieviele Rahmen für Druckvorschau erstellen?"});
        with(myDialog.dialogColumns.add()){
            with(dialogRows.add()){
                with(dialogColumns.add()){
                    staticTexts.add({staticLabel:"Spalten:", minWidth:myLabelWidth});
                    staticTexts.add({staticLabel:"Zeilen:", minWidth:myLabelWidth});                            
                }
                with(dialogColumns.add()){                            
                    var myNumberOfColumnsField = integerEditboxes.add({editValue:2});
                    var myNumberOfRowsField = integerEditboxes.add({editValue:1});
                }
            }
        }
        var myResult = myDialog.show();
        if(myResult == true){
            var myNumberOfRows = myNumberOfRowsField.editValue;
            var myNumberOfColumns = myNumberOfColumnsField.editValue;
            myDialog.destroy();
            mySplitFrames(myObjectList, myNumberOfRows, myNumberOfColumns, 0, 0, ContentType.graphicType, true, true);
        }
        else{
            myDialog.destroy();
        }
    }
    function mySplitFrames (myObjectList, myNumberOfRows, myNumberOfColumns, myRowGutter, myColumnGutter, myFrameType, myRetainFormatting, myDeleteObject)
    {
        var myOldXUnits = app.activeDocument.viewPreferences.horizontalMeasurementUnits;
        var myOldYUnits = app.activeDocument.viewPreferences.verticalMeasurementUnits;
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
        app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;
        for(var myCounter = 0; myCounter < myObjectList.length; myCounter ++){
            mySplitFrame(myObjectList[myCounter], myNumberOfRows, myNumberOfColumns, myRowGutter, myColumnGutter, myFrameType, myRetainFormatting, myDeleteObject);
        }
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = myOldXUnits;
        app.activeDocument.viewPreferences.verticalMeasurementUnits = myOldYUnits;
    }
    function mySplitFrame (myObject, myNumberOfRows, myNumberOfColumns, myRowGutter, myColumnGutter, myFrameType, myRetainFormatting, myDeleteObject)
    {
        var myX1, myY1, myX2, myY2, myNewObject;
        var myBounds = myObject.geometricBounds;
        var myWidth = myBounds[3]-myBounds[1];
        var myHeight =  myBounds[2]-myBounds[0];
        //Don't bother making the frames if the width/height of the frame is too small
        //to accomodate the row/column gutter values.   
        if((myRowGutter * (myNumberOfRows - 1) < myHeight) && (myColumnGutter * (myNumberOfColumns - 1) < myWidth)){
            var myColumnWidth = (myWidth - (myColumnGutter * (myNumberOfColumns - 1)))/myNumberOfColumns;
            var myRowHeight =  (myHeight - (myRowGutter * (myNumberOfRows - 1)))/myNumberOfRows;
            for(var myRowCounter = 0; myRowCounter < myNumberOfRows; myRowCounter ++){
                myY1 = myBounds[0]+(myRowHeight*myRowCounter)+(myRowGutter*myRowCounter);
                myY2 = myY1 + myRowHeight;
                for(var myColumnCounter = 0; myColumnCounter < myNumberOfColumns; myColumnCounter ++){
                    myX1 = myBounds[1]+(myColumnWidth*myColumnCounter)+(myColumnGutter*myColumnCounter);
                    myX2 = myX1 + myColumnWidth;
                    if(myRetainFormatting == true){
                        myNewObject = myObject.duplicate();
                        myNewObject.geometricBounds = [myY1, myX1, myY2, myX2];
                    }
                    else{
                        myNewObject = myObject.parent.rectangles.add(undefined, undefined, undefined, {geometricBounds:[myY1, myX1, myY2, myX2], contentType:myFrameType});
                    }
                    if(myRetainFormatting == false){
                        myNewObject.contentType=myFrameType;
                    }
                }
            }
            if(myDeleteObject == true){
                myObject.remove();
            }
        }
    }
    function myGetProperties (myObject){
        for(myProperty in myObject.properties){
        }
    }            
};