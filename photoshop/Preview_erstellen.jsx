#target photoshop
function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'PreviewDocPS.jsx'
    #include 'Job.jsx'
    #include 'JobFolder.jsx'
    #include 'Pathmaker.jsx'
    #include 'MonoNamer.jsx'
    #include 'InteractSwitch.jsx'
    #include 'ButtonList.jsx'

    //FIXME: does not work when not in a standard job folder
    var job = new Job(app.activeDocument, true);
    var pm = new Pathmaker(job.nfo);

    var iaSwitch = new InteractSwitch();
    iaSwitch.set('none');

    var saveFile = pm.file('previewPs');

    var previewObj = Object.create(previewDocPS);
    previewObj.startDoc = app.activeDocument;
    previewObj.make(saveFile);

    app.refresh();

    iaSwitch.reset();
}

main();