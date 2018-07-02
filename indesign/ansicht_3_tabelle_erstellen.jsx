#target indesign
function main () {

     
    #include 'Job.jsx'
    #include 'JobFolder.jsx'
    #include 'MonoNamer.jsx'
    #include 'MonoFilm.jsx'
    #include 'MonoMockup.jsx'
    #include 'MonoGraphic.jsx'
    #include 'MonoTextil.jsx'
    #include 'MonoTable.jsx'
    #include 'MonoPrint.jsx'
    #include 'Pathmaker.jsx'
    #include 'MonoSep.jsx'
    #include 'Typeahead.jsx'
    #include 'TexAdder.jsx'
    
    var monoMockup = new MonoMockup();
    monoMockup.init(app.activeDocument);
    
    var myPage = app.activeWindow.activePage;
    var monoGraphics = monoMockup.get_monoGraphics(myPage, monoMockup.layers.prints);
    
	var monoTable = new MonoTable(myPage);
	monoTable.create_table(myPage, true);
   
    for(var i = 0; i < monoGraphics.length; i++) {
        monoTable.add_row(monoGraphics[i]);
    }

    //indesign.executeScriptFile(File('/c/repos/adobeScripts1/indesign/ansicht_4_stand_automatik.jsx'));
    //monoTable.update_stand(monoGraphics[0]);
    //monoTable.update_row(monoGraphics[1], false);
}
main();