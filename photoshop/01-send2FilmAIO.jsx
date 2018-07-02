#target photoshop-60.064

function main() {

     
    #include 'augment_objects.jsx'
    #include 'SepDocPS.jsx'
    #include 'PreviewDocPS.jsx'
    #include 'Job.jsx'
    #include 'JobFolder.jsx'
    #include 'MonoNamer.jsx'
    #include 'Pathmaker.jsx'
    #include 'InteractSwitch.jsx'
    #include 'ButtonList.jsx'
    #include 'save_Options.jsx'

	var monoNamer = new MonoNamer();
    var job = new Job(app.activeDocument, true);
    var pm = new Pathmaker(job.nfo);

    //---------------------------------------------------------------------
    // create the separation file

    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.MM;

    var iaSwitch = new InteractSwitch();
    iaSwitch.set('none');

    var saveFile = pm.file('sepPs');

    var sepObj = Object.create(sepDocPS)
    sepObj.startDoc = app.activeDocument;
    sepObj.make(saveFile);

    sepObj.pos = sepObj.get_guide_location();
    sepObj.place_on_film(saveFile, sepObj.pos);

    app.activeDocument = sepObj.startDoc;
    //sepObj.doc.close();


    //---------------------------------------------------------------------
    // create the preview file

    var saveFile = pm.file('previewPs');
    var previewObj = Object.create(previewDocPS);
    previewObj.startDoc = app.activeDocument;
    previewObj.make(saveFile);

    app.preferences.rulerUnits = originalRulerUnits;
}

function check () {

    if(!app.activeDocument) return false;

    #include 'BaseDocPS.jsx'

    var baseDoc = Object.create(baseDocPS);
    baseDoc.doc = app.activeDocument;
    var pantoneChannels = baseDoc.check_for_pantone();
    if( pantoneChannels.length > 0) {
        var alertStr = '';
        alertStr += 'Dokument enthält Pantone-Farben in folgenden Kanälen:\n\n';
        alertStr += pantoneChannels.join('\n');
        alertStr += '\n\nBitte erst in RGB Farben wandeln!';
        alert(alertStr);
        return false;
    }

    if(baseDoc.get_spot_channels().length < 1) {
        alert('Document contains no SpotColor Channels, script cancelled');
        return false;
    }

    return true;
}

if (check()) {
    main();
}
