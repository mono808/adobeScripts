#target indesign

#includepath '/c/repos/adobeScripts1/includes'
#include 'MonoNamer.jsx'
#include 'MonoFilm.jsx'
#include 'MonoSep.jsx'
#include 'PasserFab.jsx'
#include 'Job.jsx'
#include 'Pathmaker.jsx'

function update_film () {

    var job = new Job(null, false);
    var pm = new Pathmaker();

    var myFilm = new MonoFilm(app.activeDocument);
        
    job.get_nfo (myFilm.sep.file, true, false); 

    myFilm.reset();

    myFilm.add_marks();
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