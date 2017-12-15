#target indesign

#includepath '/c/capri-links/scripts2/includes'
#include 'augment_objects.jsx'
#include 'universal_functions.jsx'
#include 'indesign_functions.jsx'
#include 'indesign_mockup_functions.jsx'
#include 'MonoGraphic.jsx'
#include 'MonoNamer.jsx'
#include 'MonoFilm.jsx'
#include 'MonoSep.jsx'
#include 'PasserFab.jsx'
#include 'statics.jsx'
#include 'variables.jsx'
#include 'Job.jsx'

function main () {

    var job = new Job(null, false);

    var mockUpDoc = app.activeDocument;
    
    for (var i = 0; i < mockUpDoc.selection.length; i++) {
        var myGraphic = new MonoGraphic(mockUpDoc.selection[i].graphics[0]);
        job.get_nfo (myGraphic.myFile, true, false);

        var myFilm = new MonoFilm();
        myFilm.place_sep(myGraphic.get_sepFile(), myGraphic.get_width(), myGraphic.get_height(), myGraphic.get_displacment());
        myFilm.get_sep_type();
        if(myFilm.get_all_spotColors().length > 1) {
            if(myFilm.type == 'Bags') {
                var regMarks = [4,6];
            } else {
                var regMarks = [0,2];
            }
        }
        myFilm.add_marks(regMarks);
        myFilm.add_spotInfo2();
        myFilm.add_jobInfo(job);
        myFilm.position_textFrames();
        myFilm.resize_page();
        myFilm.save(job);
    }
}

function check() {
    if(!app.activeDocument) {
        alert('Bitte Ansicht öffnen und Separation anwählen');
        return false;
    }
    
    if(app.activeDocument.selection.length < 1) {
        alert('Bitte erst ein Grafik auswählen')
        return false;
    }

    return true;
}

if(check()){
    main();
}