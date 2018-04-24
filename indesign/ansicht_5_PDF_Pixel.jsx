#target indesign

function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'Job.jsx'
    #include 'Pathmaker.jsx'
    #include 'save_Options.jsx'

    var job = new Job(null,false);
    var pm = new Pathmaker();
    var myDoc = app.activeDocument;
    var myFilename = myDoc.fullName.displayName;
    var myFolder = myDoc.fullName.parent;
    var myName = myFilename.substring(0, myFilename.lastIndexOf('.'));
        
    var distIn = new File(pm.path('ansichtIn') + myName + '.ps');
    var distOut = new File(pm.path('ansichtOut') + myName + '.pdf');
            
    var layerToggle = f_id.layerToggle(['Intern', 'HL'])
    layerToggle.hide();    
    
    f_id.print2PS(distIn, 'PixelMockup');
    
    layerToggle.show();
    
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
