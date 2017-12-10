#target indesign

function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'f_id_mock.jsx'

    var hwStr = Window.prompt('Hinweis eingeben du Vogel');
    f_id_mock.create_hinweis_frame(hwStr);

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
