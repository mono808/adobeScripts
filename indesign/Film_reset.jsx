#target indesign

#includepath '/c/capri-links/scripts2/includes'
#include 'MonoNamer.jsx'
#include 'MonoFilm.jsx'
#include 'MonoSep.jsx'
#include 'PasserFab.jsx'
#include 'statics.jsx'
#include 'variables.jsx'
#include 'Job.jsx'

function update_film () {

    var job = new Job(null, false);

    var myFilm = new MonoFilm(app.activeDocument);
        
    job.get_nfo (myFilm.sep.file, true, false); 

    myFilm.reset();

    if(myFilm.type == 'Bags') {
        var regMarks = [0,2,4,6];
    } else {
        var regMarks = [0,2,4,6];
    }
    myFilm.add_marks(regMarks);
    myFilm.add_spotInfo2();
    myFilm.add_jobInfo(job);
    myFilm.position_textFrames();
    myFilm.resize_page();
    
    myFilm.save(job, true, false);

}

function check() {
    if(!app.activeDocument) {
        alert('Bitte Ansicht öffnen und Separation anwählen');
        return false;
    }
    
    return true;
}

if(check()){
    update_film();
}