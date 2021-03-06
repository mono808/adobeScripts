﻿#target indesign
function main () {

     
    #include augment_objects.jsx;
    #include 'reflector.jsxinc'
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
    monoTable.update_columnWidths();
	//monoTable.create_table(myPage, true);
   
//~     for(var i = 0; i < monoGraphics.length; i++) {
//~         monoTable.add_row(monoGraphics[i]);
//~     }

    //monoTable.update_stand(monoGraphics[0]);
    //monoTable.update_row(monoGraphics[1], false);
}
main();