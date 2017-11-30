#target indesign

function main() {

    #include '/c/capri-links/scripts/includes/augment_objects.jsx'
    #include '/c/capri-links/scripts/includes/f_all.jsx'
    #include '/c/capri-links/scripts/includes/Job.jsx'
    #include '/c/capri-links/scripts/includes/save_Options.jsx'
    #include '/c/capri-links/scripts/includes/MonoNamer.jsx'
    #include '/c/capri-links/scripts/includes/f_id.jsx'

    var monoNamer = new MonoNamer();
    var job = new Job(null, true);

    var iDoc = app.activeDocument,
        sepRef = iDoc.allGraphics[0];

    f_id.viewPrefSwitch.set('fast');

    if(Window.confirm('Film zuschneiden?')) {
        f_id.fitPage2Art();
    }

    if(Window.confirm('Film als PDF speichern?')) {
        mofi.file('filmPdf').remove();
        f_id.print2PS(mofi.file('filmPs'), 'monoFilms');
        f_all.saveFile (mofi.file('film'), undefined, false);
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