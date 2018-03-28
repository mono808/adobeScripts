﻿#target photoshop

function main() {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'BaseDocPS.jsx'
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

    var baseDoc = Object.create(baseDoc);
    baseDoc.doc = app.activeDocument;
    baseDoc.save_doc(pm.file('workingPs'), save_ops.backupPS(), false,true);

};

if(app.activeDocument) {
    main();
}