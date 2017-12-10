#target indesign

function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'f_id_mock.jsx'    
    #include 'rE.jsx'
    #include 'Job.jsx'
    #include 'MonoGraphic.jsx'
    #include 'MonoNamer.jsx'

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