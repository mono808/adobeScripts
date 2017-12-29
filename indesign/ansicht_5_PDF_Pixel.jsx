#target indesign

function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'Job.jsx'
    #include 'Pathmaker.jsx'
    #include 'save_Options.jsx'

    //job.set_nfo(null, false);
    var pm = new Pathmaker();
    var myDoc = app.activeDocument;
    var myFilename = myDoc.fullName.displayName;
    var myFolder = myDoc.fullName.parent;
    var myName = myFilename.substring(0, myFilename.lastIndexOf('.'));
        
    var distIn = new File(pm.path('ansichtIn') + myName + '.ps');
    var distOut = new File(pm.path('ansichtOut') + myName + '.pdf');
    
    //hide internLayer
    try{myDoc.layers.item('Intern').visible = false;} catch(e){}
    f_id.print2PS(distIn, 'PixelMockup');
    
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
