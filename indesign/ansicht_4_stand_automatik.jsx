#target indesign


function main () {
    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'f_id_mock.jsx'
    
    var on = Window.confirm('Ja = Aumatik AN\nNein = Automatik AUS', false, 'StandAutomatik aktivieren?');
    f_id_mock.add_stand_listener(on);
}

function check() {
    return true;
}

if(check()) {
    main();
}