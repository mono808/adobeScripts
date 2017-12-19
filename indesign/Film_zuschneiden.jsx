#target indesign

#includepath '/c/repos/adobeScripts1/includes'
#include 'augment_objects.jsx'
#include 'MonoFilm.jsx'
#include 'MonoSep.jsx'

function main () {

    var myFilm = new MonoFilm(app.activeDocument);

    myFilm.resize_page();

}

function check() {
    if(!app.activeDocument) {
        alert('Bitte Ansicht öffnen und Separation anwählen');
        return false;
    }
    
    return true;
}

if(check()){
    main();
}