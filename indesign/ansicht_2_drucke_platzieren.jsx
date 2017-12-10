#target indesign

function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'Job.jsx'
    #include 'save_Options.jsx'
    #include 'f_id.jsx'
    #include 'f_id_mock.jsx'
    #include 'MonoNamer.jsx'
    #include 'Pathmaker.jsx'
    #include 'JobFolder.jsx'

    var job = new Job(null, false);
    var pm = new Pathmaker(job.nfo);
    var jobFolder = new JobFolder(job.nfo.folder);

    f_id.viewPrefSwitch.set('fast');

    var printsToPlace = jobFolder.get_prints();
    var printsToPlace = f_id_mock.getPrints(job.nfo.folder);
    
    f_id_mock.placePrintsOnPage(printsToPlace);
    
    if(app.activeDocument.saved === false) {
        f_all.saveFile(pm.file('mockUpIndd'), undefined, false);
    }

    f_id.viewPrefSwitch.reset();
}

main();