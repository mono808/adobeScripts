#target indesign
function main () {
    
    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'Job.jsx'
    #include 'JobFolder.jsx'
    #include 'MonoPrint.jsx'
    #include 'MonoNamer.jsx'
    #include 'MonoFilm.jsx'
    #include 'MonoMockup.jsx'
    #include 'Pathmaker.jsx'
    #include 'MonoSep.jsx'
    #include 'Typeahead.jsx'
    #include 'TexAdder.jsx'


    var job = new Job(null,false);
    var pm = new Pathmaker();
    //var typeahead = new Typeahead();
    var mockup = new MonoMockup(app.activeDocument);
    
    var texTool = new TexAdder();
    texTool.add_tex(app.activeDocument);
   
    //mockup.save();
};

main();