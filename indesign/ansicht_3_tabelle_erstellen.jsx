#target indesign

function main () {

    #include '/c/capri-links/scripts/includes/augment_objects.jsx'
    #include '/c/capri-links/scripts/includes/f_all.jsx'
    #include '/c/capri-links/scripts/includes/f_id.jsx'
    #include '/c/capri-links/scripts/includes/f_id_mock.jsx'    
    #include '/c/capri-links/scripts/includes/rE.jsx'
    #include '/c/capri-links/scripts/includes/Job.jsx'
    #include '/c/capri-links/scripts/includes/save_Options.jsx'
    #include '/c/capri-links/scripts/includes/MonoGraphic.jsx'
    #include '/c/capri-links/scripts/includes/MonoNamer.jsx'

    var job = new Job(null, false);

    var myDoc = app.activeDocument;

    f_id.viewPrefSwitch.set('fast');

    var i, maxI, myPage, printsLayer, pageGraphics, myTable,
        myGraphics = {};

    myPage = myDoc.layoutWindows[0].activePage;
    
    printsLayer = myDoc.layers.item('Prints');
    
    pageGraphics = f_id_mock.get_placed_graphics(myPage, printsLayer);
    
    myTable = f_id_mock.create_table(myPage);
    
    f_id_mock.write_graphic_infos_to_table(myTable, pageGraphics);

    f_id.viewPrefSwitch.set('normal');

    f_id_mock.add_stand_listener(true);
}

function check() {
    return true;
}

if(check()){
    main();
}