#target indesign
function main () {
    
    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'MonoMockup.jsx'
    #include 'MonoSep.jsx'
    #include 'Typeahead.jsx'
    #include 'TexAdder.jsx'

    //var job = new Job(null,false);
    //var pm = new Pathmaker(job.nfo);
    //var typeahead = new Typeahead();
    var mockup = new MonoMockup(app.activeDocument);
    mockup.add_hinweis();
};

main();