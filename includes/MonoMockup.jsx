function MonoMockup (initDoc) 
{
    var csroot = Folder($.getenv("csroot"));
    this.templates = [
        {
            type: 'bags',
            file: File(csroot.fullName + '/produktion/druckvorstufe/scriptVorlagen/ansicht/taschen/Ansicht_Taschen_Master.indd'),
            scale : 4.5
        },
        {
            type: 'shirts',            
            file : File(csroot.fullName + '/produktion/druckvorstufe/scriptVorlagen/ansicht/shirts/Ansicht_Shirt_Master.indd'),
            fileCC18 : File(csroot.fullName + '/produktion/druckvorstufe/scriptVorlagen/ansicht/shirts/Ansicht_Shirt_Master_cc2018.indd'),
            scale : 6.5
        },
        {
            type: 'shirts-CC2018',            
            file : File(csroot.fullName + '/produktion/druckvorstufe/scriptVorlagen/ansicht/shirts/Ansicht_Shirt_Master_cc2018.indd'),
            scale : 6.5
        },        
        {
            type: 'accessoires',
            file : File(csroot.fullName + '/produktion/druckvorstufe/scriptVorlagen/ansicht/taschen/Ansicht_Accessoires_Master.indd'),
            scale : 3
        }
    ];
    this.doc;
    this.type;
    this.scale;
    this.masterPages = {};
    this.layers = {};
    this.template;

    if(initDoc && initDoc.constructor.name == 'Document') this.init(initDoc);
};

MonoMockup.prototype.typeahead = new Typeahead();
MonoMockup.prototype.texTool = new TexAdder();

MonoMockup.prototype.import_pages = function () 
{

    //var templateFile = this.get_scale() > 5 ? this.templates.shirts.file : this.templates.bags.file;        
    this.templateDoc = app.open(this.template.file, false);
    
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
    
    var retArray = this.typeahead.show_dialog(this.templates, 'type');
    this.template = retArray[0] ? retArray[0] : null;
    
    if(!this.template) return;
    this.templateDoc = app.open(this.template.file);

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
            monoFilm.filmDoc.close(SaveOptions.ASK);
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
    var mN = new MonoNamer();
    
    for (var g = 0; g < myPage.allGraphics.length; g++) 
    {  
        var placedGraphic = myPage.allGraphics[g];
        if (placedGraphic.itemLayer === myLayer) {
            var myGraphic = new MonoGraphic(placedGraphic);
            myGraphics.push(myGraphic);
        }
    }
    
    myGraphics.sort(function(a,b) {        
        return mN.name('posOrder', a.get_side()) > mN.name('posOrder', b.get_side());
    });

    return myGraphics;
};

MonoMockup.prototype.get_all_monoGraphics = function () 
{
    var printsLayer = this.layers.prints;
    var previewMaster = this.doc.masterSpreads.item('C-Preview');
    var monoGraphics = [];
    for (var i = 0; i < this.doc.allGraphics.length; i++) {
        var graphic = this.doc.allGraphics[i];
        if(graphic.parent.itemLayer != printsLayer) continue;
        if(!graphic.parentPage || graphic.parentPage.appliedMaster == previewMaster) continue;
        monoGraphics.push(new MonoGraphic(graphic));
    }
    return monoGraphics;
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

MonoMockup.prototype.show_hinweisDialog = function () {
    //<fragment>
	var myDialog = app.dialogs.add({name:"Hinweis erstellen", canCancel:true});
	with(myDialog){
		//Add a dialog column.
		with(dialogColumns.add()){
			//Create a border panel.
			with(borderPanels.add()){
				with(dialogColumns.add()){
					//The following line shows how to set a property as you create an object.
					staticTexts.add({staticLabel:"Hinweis:"});
				}
				with(dialogColumns.add()){
					//The following line shows how to set multiple properties as you create an object.
					var myTextEditField = textEditboxes.add({editContents:"Das ist ein Hinweis!", minWidth:180});
				}
			}

			//Create another border panel.
			with(borderPanels.add()){
				staticTexts.add({staticLabel:"Typ:"});
				var myRadioButtonGroup = radiobuttonGroups.add();
				with(myRadioButtonGroup){
					var myLeftRadioButton = radiobuttonControls.add({staticLabel:"Interner Hinweis", checkedState:true});
					var myCenterRadioButton = radiobuttonControls.add({staticLabel:"Kunden Hinweis"});
				}
			}
		}
	}
	//Display the dialog box.
	if(myDialog.show() == true){
		var myString, mytarget;
		//If the user didn’t click the Cancel button,
		//then get the values back from the dialog box.	
		//Get the example text from the text edit field.
		myString = myTextEditField.editContents

		//Get the paragraph alignment setting from the radiobutton group.
		if(myRadioButtonGroup.selectedButton == 0){
			myTarget = 'Intern';
		}
		else {
			myTarget = 'Infos';
		}

        myDialog.destroy();
        return {
            hinweis: myString,
            layername : myTarget
        }
	} else{
		myDialog.destroy()
        return null;
	}
};

MonoMockup.prototype.add_hinweis = function () 
{
    var myPage = app.activeWindow.activePage;
    var doc = myPage.parent.parent;
    
    var dialogResult = this.show_hinweisDialog();
    
    if(!dialogResult) return;

    var lastLayer = doc.activeLayer;
    var myLayer = doc.layers.item(dialogResult.layername);
    doc.activeLayer = myLayer;

/*     try{
        var tFBounds = doc.masterSpreads.item('A-FixedStuff').pageItems.item('hinweisFrame').geometricBounds;
    } catch(e) {
        var tFBounds = [400,400,1000,1000];
    } */

    try {
      var oStyle = doc.objectStyles.item('hinweisFrameStyle');
      var check = oStyle.name;
    } catch(e){
      var oStyle = doc.objectStyles.item(0);
    }
    
    var tFBounds = [800,32.5,1000,600];
    var myTF = myPage.textFrames.add({
            geometricBounds: tFBounds,
            itemLayer: myLayer,
            name: 'hinweisFrame',
            appliedObjectStyle: oStyle
        });

    myTF.contents = dialogResult.hinweis;

    try {
      var pStyle = doc.paragraphStyles.item('hinweisTextStyle');
      var check = pStyle.name;
    } catch(e){
      var pStyle = doc.paragraphStyles.add();
    }
    with(pStyle){
        appliedFont = "Myriad Pro";
        fontStyle = "Regular";
        pointSize = 15 * this.scale;
        fillColor = "C=0 M=100 Y=0 K=0";
        justification = Justification.LEFT_ALIGN;
    }

    myTF.paragraphs.item(0).applyParagraphStyle(pStyle);

    doc.activeLayer = lastLayer;
    return myTF;
};

MonoMockup.prototype.add_stand_listener = function (turnOn) 
{
    var doc = app.activeDocument;
    var myPage = app.activeWindow.activePage;
    var l = doc.layers.item('Infos');

    var includesFolder = $.getenv('JSINCLUDE');
    doc.removeEventListener("afterSelectionAttributeChanged", new File(includesFolder + '/myStandListener.jsx'));
    if(turnOn) doc.addEventListener("afterSelectionAttributeChanged", new File(includesFolder + '/myStandListener.jsx'));
};

MonoMockup.prototype.remove_stand_listener = function () 
{
    var doc = app.activeDocument;
    var myPage = app.activeWindow.activePage;
    var l = doc.layers.item('Infos');

    var includesFolder = $.getenv('JSINCLUDE');
    doc.removeEventListener("afterSelectionAttributeChanged", new File(includesFolder + '/myStandListener.jsx'));                
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