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
    
    var myFile = File('/c/capri-stuff/Kundendaten/B2B/Criminals/0546A17-014_Mausi-Shirts/Druckdaten-SD/0546A17-014_Mausi-Shirts_Front_220x245_SD_Film.indd');
    var monoFilm = new MonoFilm(myFile);

}
main();