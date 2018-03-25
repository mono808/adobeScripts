#target photoshop
function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'DtgDocPS.jsx'
    #include 'Job.jsx'
    #include 'JobFolder.jsx'
    #include 'Pathmaker.jsx'
    #include 'MonoNamer.jsx'
    #include 'InteractSwitch.jsx'
    #include 'ButtonList.jsx'

    var job = new Job(app.activeDocument, true);
    var pm = new Pathmaker(job.nfo);

    var iaSwitch = new InteractSwitch();
    iaSwitch.set('none');

    var saveFile = pm.file('sepPs');
    var mySepDoc = Object.create(sepDocPS);
    mySepDoc.make(saveFile);
    
    var sep = new SepDocPS(app.activeDocument, saveFile);
    app.refresh();
    //if(Window.confirm ('Doc ok?', false, 'Check Document')) sep.doc.close();
    app.activeDocument = baseDoc.doc;
    
    // var styles = ['merged', 'layered'];

    // var infoText = 'Please choose the style of the PreviewFile:\r\r';
    // infoText += 'Layered -> SpotChannels are displayed as Layers, all colors are 100% opaque\r\r';
    // infoText += 'Merged  -> SpotChannels are merged to flat RGB File, better opacity simulation';
    // var style = new ButtonList('Choose Preview Style', infoText).show_dialog(styles);

    // var saveFile = pm.file('previewPs');
    // var preview = new PreviewDocPS(app.activeDocument, style, saveFile);
    // app.refresh();
    //if(Window.confirm ('Doc ok?', false, 'Check Document')) preview.doc.close();
    //app.activeDocument = baseDoc.doc;

    //var saveFile = pm.file('previewPs');
    //var preview = new PreviewDocPS(app.activeDocument, 'layered');
    //app.refresh();
    //if(Window.confirm ('Doc ok?', false, 'Check Document')) preview.doc.close();
    //app.activeDocument = baseDoc.doc;

    iaSwitch.reset();
}
main();