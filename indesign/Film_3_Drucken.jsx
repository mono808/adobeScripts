#target indesign

function main() {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'Job.jsx'
    #include 'save_Options.jsx'
    #include 'Pathmaker.jsx'

    var job = new Job(null, true);
    var pm = new Pathmaker(job.nfo);

    var iDoc = app.activeDocument,
        sepRef = iDoc.allGraphics[0];

    f_id.viewPrefSwitch.set('fast');

    if(Window.confirm('Film zuschneiden?')) {
        f_id.fitPage2Art();
    }

    if(Window.confirm('Film als PDF speichern?')) {        
        pm.file('filmPdf').remove();
        f_id.print2PS(pm.file('filmPs'), 'monoFilms');
        f_all.saveFile (pm.file('film'), undefined, false);
        //f_all.copy_file_via_bridgeTalk(mofi.file('filmPdf'), mofo.folder('filmdaten'), false);
    } 

    f_id.viewPrefSwitch.set('normal');
}

function check() {
    if(app.documents.length > 0) {
        return true;
    } else {
        alert('no open documents!');
        return false;
    }
}

if(check()) {
    main();
}