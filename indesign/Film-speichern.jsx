#target indesign

#include 'MonoFilm.jsx'
#include 'MonoSep.jsx'
#include 'statics.jsx'
#include 'variables.jsx'
#include 'Job.jsx'

function update_film () {

    var job = new Job(null, false);

    var myFilm = new MonoFilm(app.activeDocument);
        
    job.get_nfo (myFilm.sep.file, true, false);
    
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