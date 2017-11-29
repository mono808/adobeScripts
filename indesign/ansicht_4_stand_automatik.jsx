#target indesign


function main () {

    #include '/c/capri-links/scripts/includes/f_id_mock.jsx'
    
    var on = Window.confirm('Ja = Aumatik AN\nNein = Automatik AUS', false, 'StandAutomatik aktivieren?');
    f_id_mock.add_stand_listener(on);
}

function check() {
    return true;
}

if(check()) {
    main();
}