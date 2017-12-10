#target indesign
function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'Job.jsx'
    #include 'JobFolder.jsx'
    #include 'MonoNamer.jsx'
    #include 'MonoFilm.jsx'
    #include 'MonoMockup.jsx'
    #include 'MonoGraphic.jsx'
    #include 'MonoTextil.jsx'
    #include 'MonoPrint.jsx'
    #include 'Pathmaker.jsx'
    #include 'MonoSep.jsx'
    #include 'Typeahead.jsx'
    #include 'TexAdder.jsx'
    
    var monoMockup = new MonoMockup();
    monoMockup.init(app.activeDocument);
    
    var myPage = app.activeWindow.activePage;
    var monoGraphics = monoMockup.get_monoGraphics(myPage, monoMockup.layers.prints);
    
    var mG = monoGraphics[0];
    
    var textil = mG.get_textil();
    var textilColor = mG.get_textil_color();
    var textilName = mG.get_textil_name();
    var width = mG.get_width();
    var filmFile = mG.get_file('film');
    var stand = mG.get_stand();
    var colors = mG.get_colors();
    var sizesMatch = mG.check_size();
    var order = mG.get_order();
    var id = mG.get_id();

}
main();