function MonoFilm (initObj, hidden)
{
    this.hidden = hidden || false;
    this.filmWidth = 420;
    this.filmHeight = 550;
    this.guideRecs = [
        {w:this.filmWidth,h:this.filmHeight,name:'max',align:'top'},
        {w:300,h:420,name:'a3',align:'top'},
        {w:120,h:300,name:'ar',align:'top'},
    ];
    this.backgroundColor = {
        space:ColorSpace.RGB,
        model:ColorModel.PROCESS,
        colorValue:[214,255,207],
        name:'bgColor'
    };
    this.colors = {};
    this.layers = {};
    this.sep = {};
    this.filmPage = null;
    this.vLine = null;
    this.hLine = null;
    this.type;

    if(initObj) {
        if (initObj instanceof File && initObj.exists) {
            this.init(app.open(initObj, false));
        } else if (initObj instanceof Document){
            this.init(initObj);
        }
    }
};

MonoFilm.prototype.init = function (initDoc) {

    this.filmDoc = initDoc;
    this.filmFile = initDoc.saved ? initDoc.fullName : null;
    this.filmPage = initDoc.pages.item(0);
    this.masterSpread  = initDoc.masterSpreads.item('A-Musterseite');   
    try {
        var bgColor = initDoc.colors.itemByName('bgColor');
        var check = bgColor.name;        
    } catch(e) {
        var bgColor = initDoc.colors.add(this.backgroundColor);
    }
    this.colors.bg = bgColor;
    this.colors.reg = initDoc.colors.item('Registration');
    this.colors.none = initDoc.swatches.item('None');

    with (initDoc.viewPreferences){
        horizontalMeasurementUnits = MeasurementUnits.millimeters;
        verticalMeasurementUnits = MeasurementUnits.millimeters;
        rulerOrigin = RulerOrigin.pageOrigin;
    }

    with (initDoc.textDefaults) {
        appliedFont = app.fonts.item('Myriad Pro');
        justification = Justification.LEFT_ALIGN;
        pointSize = 8;
        leading = 8;
        hyphenation = false;
    }

    try {
        var vL = initDoc.guides.item('vLine');
        //$.writeln(vL.name);
        vL.label = vL.name = 'vLine';
        this.vLine = vL;
        var hL = initDoc.guides.item('hLine');
        //$.writeln(hL.name);
        hL.label = hL.name = 'hLine';
        this.hLine = hL;
    } catch (e) {}

    // set layers
    this.layers.guides = this.check_create_layer('hilfsLayer', 'guides');
    this.layers.sep    = this.check_create_layer('motivEbene', 'sep');
    this.layers.job    = this.check_create_layer('infoEbene', 'job');
    this.layers.colors = this.check_create_layer('farbenEbene', 'colors');
    this.layers.reg    = this.check_create_layer('passerEbene', 'reg');
    
    initDoc.activeLayer = this.layers.sep;

    this.get_sep();
    //if(!this.hidden) this.type = this.get_type();
};

MonoFilm.prototype.create_template = function () 
{
    var myDocPreset = app.documentPresets.item("filmShirtPreset");
    try {var myPresetName = myDocPreset.name}
    catch (myError){myDocPreset = app.documentPresets.add({name:"filmShirtPreset"})}

    with(myDocPreset) {
        facingPages = false;
        pageHeight = this.filmHeight;
        pageWidth = this.filmWidth;
        top = 0;
        left = 0;
        bottom = 0;
        right = 0;
    }

    var newDoc = app.documents.add(!this.hidden, myDocPreset, {});
    newDoc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;
    if(!this.hidden) {
        newDoc.layoutWindows.item(0).viewDisplaySetting = ViewDisplaySettings.OPTIMIZED;
    }
    
    // remove default Swatches
    for (var i = newDoc.swatches.length-1; i >= 0; i -= 1) {
        var swatch = newDoc.swatches[i];
        if(swatch.name != 'Registration' && swatch.name != 'None' && swatch.name != 'Paper' && swatch.name != 'Black') {
            swatch.remove();
        }
    }

    var guidesLayer = newDoc.layers.item(newDoc.layers.length-1);
    with (guidesLayer) {
        name = 'guides';
        printable = false;
        visible = true;
        locked = false;
    }

    var vLine = {
        name: 'vLine',
        orientation: HorizontalOrVertical.vertical,
        location: this.filmWidth/2,
        fitToPage:false
    };
    var hLine = {
        name: 'hLine',
        orientation: HorizontalOrVertical.horizontal,
        location: 0,
        fitToPage:false
    };

    var vLine = newDoc.guides.add(undefined, vLine);
    var hLine = newDoc.guides.add(undefined, hLine);

    this.init(newDoc);

    // create guide objects and a colored background
    for (var i = 0, maxI = this.guideRecs.length; i < maxI; i += 1) {
        var rec = this.create_guide_rectangles(this.guideRecs[i]);
    }
    
    // lock the guidesLayer so it does not interfer when manually placing a graphicfile
    guidesLayer.locked = true;

    return newDoc;
};

MonoFilm.prototype.check_create_layer = function (/* ... */)
{
    if(arguments && arguments.length > 0) {
        var target = arguments[0];       
        for(var i=0; i < arguments.length; i ++) {
            var name = arguments[i];
            try {
                var l = this.filmDoc.layers.itemByName(name);
                //$.writeln(l.name);
                if(l.name != target) {l.name = target}
                return l;
            } catch (e) {}
        }
    }
    return this.filmDoc.layers.add({name:target});
};

MonoFilm.prototype.get_layer = function(/*...*/) 
{
    if(arguments && arguments.length > 0) {
        for(var i=0; i < arguments.length; i ++) {
            var name = arguments[i];
            try {
                var l = this.filmDoc.layers.itemByName(name);
                //$.writeln(l.name);
                return l;
            } catch (e) {}
        }
    }
    return null;
};

MonoFilm.prototype.create_guide_rectangles = function (guideRec) 
{

    var pC = {x:this.vLine.location, y:this.filmDoc.documentPreferences.pageHeight/2},
    pageGB = this.filmPage.bounds;

    var myBounds = [];
    switch (guideRec.align) {
        case 'top' :
            myBounds[0] = pageGB[0];
            myBounds[1] = pC.x - guideRec.w/2;
            myBounds[2] = pageGB[0]+guideRec.h;
            myBounds[3] = pC.x+guideRec.w/2;
        break;
        case 'center' :
            myBounds[0] = pC.y - guideRec.h/2;
            myBounds[1] = pC.x - guideRec.w/2;
            myBounds[2] = pC.y + guideRec.h/2;
            myBounds[3] = pC.x + guideRec.w/2;
        break;          
    }
    var rec = this.filmPage.rectangles.add({itemLayer:this.layers.guides,name:guideRec.name, geometricBounds:myBounds, locked:true});
    if(guideRec.name === 'max') {rec.fillColor = this.colors.bg;}
    else {rec.fillColor = this.colors.none;}  
    return rec;
};

MonoFilm.prototype.place_sep = function (graphicFile, width, height, displacement) 
{
    this.layers.sep = this.check_create_layer('motivEbene','sep');
    this.filmDoc.activeLayer = this.layers.sep;

    this.sep = new MonoSep(this.filmPage.place(graphicFile)[0]);

    if(width && height) this.sep.resize(width, height);

    if (displacement) {
        // position sep according to displacment
        var
        xRef = this.vLine.location,
        sepCoor = {};

        sepCoor.x = xRef + displacement;
        sepCoor.y = 100;
        this.sep.rect.move( [sepCoor.x, sepCoor.y] );
        //$.writeln('Sep placed according to PlacementInfos');

    } else {
        // center sep on page
        var 
        iWidth = this.sep.graphic.geometricBounds[3] - this.sep.graphic.geometricBounds[1],
        iHeight = this.sep.graphic.geometricBounds[2] - this.sep.graphic.geometricBounds[0],
        pWidth = this.filmDoc.documentPreferences.pageWidth,
        pHeight = this.filmDoc.documentPreferences.pageHeight,
        centerCoor = {};

        centerCoor.x = pWidth/2 - iWidth /2;
        centerCoor.y = pHeight/2 - iHeight /2;
        this.sep.rect.move( [centerCoor.x, centerCoor.y] );            
        if(!this.hidden)alert('keine Platzierungsinfo erhalten, zentriere Separation auf dem Film');
    }
};

MonoFilm.prototype.get_sep = function () 
{
    if(this.layers.sep.allGraphics.length > 0 ) {
        this.sep = new MonoSep(this.layers.sep.allGraphics[0]);
        return this.sep;
    }    
};

MonoFilm.prototype.add_centermarks = function () 
{    
    if(!this.type) this.get_sep_type();
    
    var passerFab = new PasserFab(this.type, this.vLine.location, this.sep);
    passerFab.add_centerMarks();   

};

MonoFilm.prototype.add_regmarks = function () 
{    
    if(!this.type) this.get_sep_type();
    
    if(this.type == 'Bags') {
        var regMarks = [0,2,4,6];
    } else {
        var regMarks = [0,2,4,6];
    }

    var passerFab = new PasserFab(this.type, this.vLine.location, this.sep);
        
    if(regMarks && regMarks.length > 0 && this.get_all_spotColors().length > 1) {
        passerFab.add_regMarks(regMarks);
    }
};

MonoFilm.prototype.create_text_frame = function (layer,frameName)
{
    var tfWidth = 120,
        tfHeight = 10,
        textBounds = [];

    textBounds[0] = 0;
    textBounds[1] = this.filmDoc.documentPreferences.pageWidth/2 - tfWidth/2;
    textBounds[2] = tfHeight;
    textBounds[3] = this.filmDoc.documentPreferences.pageWidth/2 + tfWidth/2;

    var tF = this.filmPage.textFrames.add( { geometricBounds : textBounds, contents : ' ', itemLayer : layer} );
    with(tF.textFramePreferences) {
        autoSizingType = AutoSizingTypeEnum.OFF;
        useNoLineBreaksForAutoSizing = false;
    }

    tF.name = frameName;
    tF.contents = '';
    return tF;
};


MonoFilm.prototype.add_jobInfo = function (job)
{

    this.layers.job = this.check_create_layer('infoEbene','job');
    this.filmDoc.activeLayer = this.layers.job;

    var infoTF = this.create_text_frame(this.layers.job, 'infoTextFrame');
    var infoText = infoTF.texts[0];
    var mN = new MonoNamer();
       
    infoText.fillColor = this.colors.reg;
    infoText.hyphenation = false;
      
    var jobString = '';
    if(job.nfo.client && job.nfo.jobNr && job.nfo.jobName && job.nfo.printId) {
        var printId = mN.name('printId', job.nfo.printId);
        jobString += job.nfo.client + ' | ' + job.nfo.jobNr + '_' + job.nfo.jobName + '\n' + printId;
    } else {
        jobString += this.sep.name.substring(0, this.sep.name.lastIndexOf('.'));
    }
        
    jobString += ' | ' + this.sep.get_width() + 'x' + this.sep.get_height() + 'mm | ' + $.getenv('USERNAME');

    infoTF.contents += jobString;
    
    this.fit_frame_to_text(infoTF);
    this.jobFrame = infoTF;
    return infoTF;
};

MonoFilm.prototype.add_spotInfo_numbered = function ()
{
    this.layers.colors = this.check_create_layer('farbenEbene','colors');
    this.filmDoc.activeLayer = this.layers.colors;    

    var doc = this.filmDoc;
    var colorTF = this.create_text_frame(this.layers.colors, 'colorTextFrame');
    var colorText = colorTF.texts.item(0);
    
    colorText.contents = '';
    colorText.hyphenation = false;
    colorText.allowArbitraryHyphenation;
  
    var spots = this.get_all_spotColors();
    var mN = new MonoNamer();
    var charIndex = 0;           

    for (var i = 0; i < spots.length; i += 1)  {
        
        var spot = spots[i];
        var spotString = '#';
        spotString += i+1;
        spotString += '/';
        spotString += spots.length;
        spotString += '\xa0';
        spotString += mN.name('color', (spot.name));
        spotString = spotString.replace(/\s/g, '\xa0');
        
        colorTF.contents += spotString;
        colorTF.contents += ' ';

        var spotChars = colorText.characters.itemByRange(charIndex, charIndex + spotString.length-1);
        spotChars.fillColor = spot;
        charIndex += spotString.length + 1;
    }

    this.fit_frame_to_text(colorTF);
    this.spotsFrame = colorTF;
    return colorTF;
};

MonoFilm.prototype.add_spotInfo2 = function ()
{
    
    this.layers.colors = this.check_create_layer('farbenEbene', 'colors');
    this.filmDoc.activeLayer = this.layers.colors;

    var doc = this.filmDoc;
    var colorTF = this.create_text_frame(this.layers.colors, 'colorTextFrame');
    var colorText = colorTF.texts.item(0);
    
    colorTF.contents = '< ';
    colorText.hyphenation = false;
    colorText.allowArbitraryHyphenation;
  
    var spots = this.get_all_spotColors();
    var mN = new MonoNamer();
    var charIndex = 2;
    var divString = ' | ';

    for (var i = 0; i < spots.length; i += 1)  {
        
        var spot = spots[i];
        var spotString = mN.name('color', (spot.name)).replace(/\s/g, '\xa0');
        
        colorTF.contents += spotString;
        var spotChars = colorText.characters.itemByRange(charIndex, charIndex + spotString.length-1);
        spotChars.fillColor = spot;
        charIndex += spotString.length;

        if(i < spots.length-1) {
            colorTF.contents += divString;
            var regChars = colorText.characters.itemByRange(charIndex, charIndex + divString.length-1);
            regChars.fillColor = this.colors.reg;
            charIndex += divString.length;
        }
    }
    colorTF.contents += ' >';
    colorText.characters.firstItem().fillColor = this.colors.reg;
    colorText.characters.lastItem().fillColor = this.colors.reg;

    this.fit_frame_to_text(colorTF);
    this.spotsFrame = colorTF;
    return colorTF;
};

MonoFilm.prototype.choose_type = function () 
{
    var myDialog = app.dialogs.add({name:"User Interface Example Script", canCancel:true});
    with(myDialog){
        //Add a dialog column.
        with(dialogColumns.add()){
            //Create another border panel.
            with(borderPanels.add()){
                staticTexts.add({staticLabel:"Film für:"});
                var myRadioButtonGroup = radiobuttonGroups.add();
                with(myRadioButtonGroup){
                    var shirtRB = radiobuttonControls.add({staticLabel:"Shirts", checkedState:true});
                    var taschenRB = radiobuttonControls.add({staticLabel:"Taschen"});
                    var kARB = radiobuttonControls.add({staticLabel:"kein Plan"});
                }
            }
        }
    }
    //Display the dialog box.
    if(myDialog.show() == true){
        var myFilmType;
        //Get the paragraph alignment setting from the radiobutton group.
        if(myRadioButtonGroup.selectedButton == 0){
            myFilmType = 'Shirts';
        }
        else if(myRadioButtonGroup.selectedButton == 1){
            myFilmType = 'Bags';
        }
        else {
            myFilmType = 'Null';
        }
        myDialog.destroy();
        this.type = myFilmType;
        return myFilmType;
    }
    else{
        myDialog.destroy()
    }    
};

MonoFilm.prototype.get_sep_type = function () 
{
    var type = null;
    if(this.sep && this.sep.name) {
        var beutel = /(tasche|beutel)/i;
        var shirt = /(front|back|brust|ruecken|rücken|vorne mittig|schulter|nacken)/i;
        if(this.sep.name.match(beutel)) {
            type = 'Bags';
        }
        if(this.sep.name.match(shirt)) {
            type = 'Shirts';
        }
    }
    this.type = type ? type : this.choose_type();
    return type;
};

MonoFilm.prototype.get_picto_type = function () 
{
    for (var i = 0; i < this.layers.reg.pageItems.length; i++) {
        var pI = this.layers.reg.allPageItems[i];
        switch(pI.name) {
            case 'pictoShirt' : return 'Shirts';
            break;
            case 'pictoBags' : return 'Bags';
            break;
            case 'pictoNull' : return 'Null';
            break;
        }
    }
    return this.choose_type();
};

MonoFilm.prototype.fit_frame_to_text = function (txtFrm) 
{
    txtFrm.fit(FitOptions.FRAME_TO_CONTENT);
    
    var oldBounds,
        newBounds;
    
    while (txtFrm.overflows) {
        oldBounds = txtFrm.geometricBounds;
        newBounds = [oldBounds[0], oldBounds[1], oldBounds[2]+1, oldBounds[3]];
        this.reframe_item(txtFrm, newBounds);
    }
    
    while (!txtFrm.overflows) {
        oldBounds = txtFrm.geometricBounds;
        newBounds = [oldBounds[0], oldBounds[1]+1, oldBounds[2], oldBounds[3]-1];
        this.reframe_item(txtFrm, newBounds);
    }

    // underline characters get cut off, so add 1mm below the last line
    oldBounds[2] += 1;
    this.reframe_item(txtFrm, oldBounds);
    return txtFrm;
};

MonoFilm.prototype.reframe_item = function (item, newBounds) 
{
    if(item.constructor.name === 'Page') {
        var rec = item.rectangles.add({ geometricBounds: [newBounds[0], newBounds[1], newBounds[2], newBounds[3]] });
    } else {
        if(item.parentPage) {
            var rec = item.parentPage.rectangles.add({ geometricBounds: [newBounds[0], newBounds[1], newBounds[2], newBounds[3]] });
        } else {
            var rec = item.parent.rectangles.add({ geometricBounds: [newBounds[0], newBounds[1], newBounds[2], newBounds[3]] });
        }
    }

    var topLeft = rec.resolve(AnchorPoint.TOP_LEFT_ANCHOR,CoordinateSpaces.SPREAD_COORDINATES)[0],
        bottomRight = rec.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR,CoordinateSpaces.SPREAD_COORDINATES)[0],
        corners = [topLeft, bottomRight];

    rec.remove();
    
    item.reframe(CoordinateSpaces.SPREAD_COORDINATES, corners);
    return item;
};

MonoFilm.prototype.get_all_spotColors = function () 
{
    var spots = [];
    var doc = this.filmDoc;

    var i = doc.colors.length - 1;
    do {
        var c = doc.colors[i];
        if(c.properties.model == ColorModel.SPOT) {
            spots.push(c);    
        }
    }while(i--)

    spots.sort(function(a,b) {
        return a.id - b.id;
    });

    return spots;
};

MonoFilm.prototype.get_spotNames = function (longNames) 
{
    var spots = this.get_all_spotColors();
    var names = [];
    var mN = new MonoNamer();
    for (var i = 0; i < spots.length; i++) {
        var colorName = longNames ? mN.name('color', spots[i].name) : spots[i].name;
        colorName = colorName.replace(/\s/g, '\xa0');
        names.push(colorName);
    }

    return names;
};

MonoFilm.prototype.position_textFrames = function () 
{
    function move_item1_below_item2 (item1, item2, distance) 
    {
        var x = item2.geometricBounds[1];
        var y = item2.geometricBounds[2] + distance;
        item1.move([x,y]);
    }

    function move_item1_above_item2 (item1, item2, distance)
    {
        var item1Height = item1.geometricBounds[2] - item1.geometricBounds[0];
        var x = item2.geometricBounds[1];
        var y = item2.geometricBounds[0] - item1Height - distance;
        item1.move([x,y]);
    }

    function move_item1_next_to_item2 (item1, item2, distance)
    {
        var x = item2.geometricBounds[3] + distance;
        var y = item2.geometricBounds[0];
        item1.move([x,y]);
    }

    var topMark = this.filmPage.pageItems.itemByName('topMark');
    var bottomMark = this.filmPage.pageItems.itemByName('bottomMark');

    var placeInfoNextTo = this.type == 'Bags' ? bottomMark : topMark;

    move_item1_next_to_item2(this.jobFrame, placeInfoNextTo, 10);
    move_item1_below_item2(this.spotsFrame, this.jobFrame, 0.5);
};

MonoFilm.prototype.select_all_printable_pageItems = function () 
{
    var doc = this.filmDoc,
        selection = [];

    var i, 
        maxI = doc.allPageItems.length,
        pI;
    for (i = 0; i < maxI; i+=1) {
        pI = doc.allPageItems[i];
        
        if (pI.locked == false 
            && pI.name != 'sepBG' 
            && pI.itemLayer != this.layers.guides)
        {
            selection.push(pI);
        };
    };
    return selection;
};

MonoFilm.prototype.get_bounds_of_selection = function (mySelection) 
{

    var selBounds = mySelection[0].geometricBounds,
        j;

    maxI = mySelection.length;

    for (i = 0; i < maxI; i+=1) {
        pI = mySelection[i];
        for (j = 0; j < pI.geometricBounds.length; j+=1) {
            
            if ( j === 0 || j === 1 ) {
                if (pI.geometricBounds[j] < selBounds[j]) {
                    selBounds[j] = pI.geometricBounds[j]
                };
            } else if ( j === 2 || j === 3) {
                if (pI.geometricBounds[j] > selBounds[j]) {
                    selBounds[j] = pI.geometricBounds[j];
                };
            };
        };
    };

    return selBounds;
};

MonoFilm.prototype.resize_page = function () 
{
    var sel = this.select_all_printable_pageItems();
    var bounds = this.get_bounds_of_selection(sel);

    var rec = this.filmPage.rectangles.add({ geometricBounds: [bounds[0], bounds[1], bounds[2], bounds[3]] });

    var topLeft = rec.resolve(AnchorPoint.TOP_LEFT_ANCHOR,CoordinateSpaces.SPREAD_COORDINATES)[0];
    var bottomRight = rec.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR,CoordinateSpaces.SPREAD_COORDINATES)[0];
    var corners = [topLeft, bottomRight];

    rec.remove();
    
    this.filmPage.reframe(CoordinateSpaces.SPREAD_COORDINATES, corners);

    app.layoutWindows[0].zoom(ZoomOptions.FIT_PAGE);
};

MonoFilm.prototype.reset = function () 
{
    this.layers.reg.pageItems.everyItem().remove();
    this.layers.colors.pageItems.everyItem().remove();
    this.layers.job.pageItems.everyItem().remove();
};

MonoFilm.prototype.save = function (job, showDialog, close) 
{
    var wxhRE = /\d{2,3}x\d{2,3}_/i;
    var saveFolder = this.sep.folder;
    var saveName = this.sep.name.substring(0, this.sep.name.lastIndexOf('.'));

    //saveName = saveName.replace(/_(sep|print|druck)/i, '').replace(wxhRE, '');
    saveName = saveName.replace(/_(sep|print|druck)/i, '')
    saveName += '_Film.indd';

    if(job && job.nfo.jobNr && job.nfo.jobName) {
        var jobTag = job.nfo.jobNr + '_' + job.nfo.jobName + '_';
        saveName = jobTag + saveName;
    }

    var saveFile = new File(saveFolder.fullName + '/' + saveName);

    if(showDialog)
        saveFile = saveFile.saveDlg('Please check Filename');

    if(saveFile)
        this.filmDoc.save(saveFile);
        this.filmFile = this.filmDoc.fullName;
    
    if(close)
        saveDoc.close();
};

MonoFilm.prototype.print_to_postscript = function (myDoc, targetFile, printPreset) 
{
    var myPPreset = printPreset.constructor.name == 'PrinterPreset' ? printPreset : app.printerPresets.item(printPreset);
    var f = targetFile instanceof File ? targetFile : new File(targetFile);
    var doc = myDoc && myDoc.constructor.name == 'Document' ? myDoc : app.activeDocument;
    var myDPPref = doc.printPreferences;

    with(myDPPref) {
        printer = Printer.postscriptFile;
        activePrinterPreset = myPPreset;        
        printFile = f;            
    }

    return doc.print(false, undefined);
};

MonoFilm.prototype.print = function ()
{
    if(!this.filmDoc.saved) {
        alert('Film wurde noch nicht gespeichert, bitte erst abspeichern');
        return;
    }
    var saveName = this.filmDoc.name.substring(0, this.filmDoc.name.lastIndexOf('.'));
    var saveFolder = this.filmDoc.fullName.parent;
     
    var pdfName = saveName + '.pdf';
    var pdfFile = new File(pm.path('filmOut') + pdfName);
    
    var psName = saveName + '.ps';
    var psFile = new File(pm.path('filmIn') + psName);

    this.print_to_postscript (this.filmDoc, psFile, 'monoFilms');
};

MonoFilm.prototype.get_sepPos = function ()
{
    var vPrefs = this.filmDoc.viewPreferences;
    var oldXUnits;
    var oldYUnits;

    oldXUnits = vPrefs.horizontalMeasurementUnits,
    oldYUnits = vPrefs.verticalMeasurementUnits,            
    vPrefs.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
    vPrefs.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
    
    var sepBounds = this.sep.rect.geometricBounds;

    var deltaX = sepBounds[1] - this.vLine.location;
    var deltaY = sepBounds[0] - this.hLine.location;

    vPrefs.horizontalMeasurementUnits = oldXUnits;
    vPrefs.verticalMeasurementUnits = oldYUnits;

    return {
        'deltaX' : deltaX,
        'deltaY' : deltaY
    };
};

MonoFilm.prototype.get_sepWidth = function ()
{
    var vPrefs = this.filmDoc.viewPreferences;
    var oldXUnits;
    var oldYUnits;

    oldXUnits = vPrefs.horizontalMeasurementUnits,
    oldYUnits = vPrefs.verticalMeasurementUnits,            
    vPrefs.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
    vPrefs.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
    
    var sepBounds = this.sep.rect.geometricBounds;
    var sepWidth = sepBounds[3] - sepBounds[1];

    vPrefs.horizontalMeasurementUnits = oldXUnits;
    vPrefs.verticalMeasurementUnits = oldYUnits;

    return sepWidth;
};

MonoFilm.prototype.close = function (saveOpts)
{
    if(!this.filmDoc.saved) {
        alert('Film wurde noch nicht gespeichert, bitte erst abspeichern');
        return;
    }
    if(saveOpts) {
        this.filmDoc.close(saveOpts);
    } else {       
        this.filmDoc.close();
    }
};