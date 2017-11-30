#target indesign

function main () {

    #include '/c/capri-links/scripts/includes/augment_objects.jsx'
    #include '/c/capri-links/scripts/includes/f_all.jsx'
    #include '/c/capri-links/scripts/includes/f_id.jsx'
    #include '/c/capri-links/scripts/includes/f_id_mock.jsx'    
    #include '/c/capri-links/scripts/includes/Job.jsx'
    #include '/c/capri-links/scripts/includes/save_Options.jsx'

    //job.set_nfo(null, false);

    var myDoc = app.activeDocument,
        myFilename = myDoc.fullName.displayName,
        myFolder = myDoc.fullName.parent,
        myName = myFilename.substring(0, myFilename.lastIndexOf('.'));
        
    var distIn = new File(mofo['ansichtIn'] + myName + '.ps');
    var distOut = new File(mofo['ansichtOut'] + myName + '.pdf');

    try{myDoc.layers.item('Intern').visible = false;} catch(e){}
    f_id.print2PS(distIn, 'VectorMockup');
    
    try{myDoc.layers.item('Intern').visible = true;} catch(e){}
    f_all.saveFile(app.activeDocument.fullName, undefined, false);
    
    f_all.copy_file_via_bridgeTalk(distOut, myFolder, true);
}

function check() {
    if(app.documents.length > 0 && app.activeDocument) {
        return true;
    } else {
        return false;
    }
}

if(check()) {
    main();
}
