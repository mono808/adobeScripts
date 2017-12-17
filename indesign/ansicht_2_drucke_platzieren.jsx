#target indesign
function main () {
    
    #includepath '/c/repos/adobeScripts1/includes/'
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

    /*
    for (var i = 0; i < app.documents.length; i++) {
        app.documents[i].close(SaveOptions.NO);
    }
    */

    var job = new Job(null,false);
    var pm = new Pathmaker(job.nfo);
    //var typeahead = new Typeahead();
    var mockup = new MonoMockup();
    
    //mockup.create_mockupDoc();
    mockup.init();
    //mockup.import_pages();

    //mockup.fill_job_infos(job.nfo);
    //mockup.show_shop_logo (job.nfo.shop);

    var jobFolder = new JobFolder(job.nfo.folder);
    var monoPrints = jobFolder.get_prints();

    mockup.place_prints_on_page (monoPrints);

    //mockup.add_preview_page();
    
    //mockup.save();
};

main();