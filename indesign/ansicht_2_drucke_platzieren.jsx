#target indesign

function main () {

    #include '/c/capri-links/scripts/includes/augment_objects.jsx'
    #include '/c/capri-links/scripts/includes/f_all.jsx'
    #include '/c/capri-links/scripts/includes/Job.jsx'
    #include '/c/capri-links/scripts/includes/save_Options.jsx'
    #include '/c/capri-links/scripts/includes/f_id.jsx'
    #include '/c/capri-links/scripts/includes/f_id_mock.jsx'
    #include '/c/capri-links/scripts/includes/MonoNamer.jsx'

    var job = new Job(null, false);

    f_id.viewPrefSwitch.set('fast');

    var printsToPlace = f_id_mock.getPrints(job.nfo.folder);
    
    f_id_mock.placePrintsOnPage(printsToPlace);
    
    if(app.activeDocument.saved === false) {
        f_all.saveFile(mofi.file('mockUpIndd'), undefined, false);
    }

    f_id.viewPrefSwitch.reset();
}

main();