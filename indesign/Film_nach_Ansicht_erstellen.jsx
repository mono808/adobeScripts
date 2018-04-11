#target indesign



function main () {
    
    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'Job.jsx'
    #include 'JobFolder.jsx'
    #include 'MonoNamer.jsx'
    #include 'MonoFilm.jsx'
    #include 'MonoMockup.jsx'
    #include 'MonoGraphic.jsx'
    #include 'MonoTextil.jsx'
    #include 'MonoPrint.jsx'
    #include 'Pathmaker.jsx'
    #include 'PasserFab.jsx'
    #include 'MonoSep.jsx'
    #include 'Typeahead.jsx'
    #include 'TexAdder.jsx'

    var mockUpDoc = app.activeDocument;
    
    for (var i = 0; i < mockUpDoc.selection.length; i++) {
        var monoGraphic = new MonoGraphic(mockUpDoc.selection[i].graphics[0]);
        var job = new Job (monoGraphic.get_file('print'), true, false);
        var pm = new Pathmaker(job.nfo);

        var monoFilm = new MonoFilm();
        monoFilm.create_template();
        monoFilm.place_sep(monoGraphic.get_file('print'), monoGraphic.get_width(), monoGraphic.get_height(), monoGraphic.get_displacement());
        monoFilm.get_sep_type();
        monoFilm.add_centermarks();
        monoFilm.add_spotInfo2();
        monoFilm.add_jobInfo(job);
        monoFilm.position_textFrames();
        monoFilm.resize_page();
        monoFilm.save(job);
        monoFilm.print(job, true, false);
    }
}

function check() {
    if(!app.activeDocument) {
        alert('Bitte Ansicht öffnen und Separation anwählen');
        return false;
    }
    
    if(app.activeDocument.selection.length < 1) {
        alert('Bitte erst eine Grafik auswählen');
        return false;
    }

    return true;
}

if(check()){
    main();
}