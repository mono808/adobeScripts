//#target indesign
function main () {
    
     
    #include 'f_all.jsx'    
    #include 'save_Options.jsx'
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
    if(!job.nfo) return;
    var pm = new Pathmaker(job.nfo);
    //var typeahead = new Typeahead();
    var mockup = new MonoMockup();
    
    mockup.create_mockupDoc();
    mockup.init();
    mockup.import_pages();

    mockup.save();

    mockup.show_shop_logo(job.nfo.shop);
    mockup.fill_job_infos(job.nfo);

//~     var mockup = new MonoMockup(app.activeDocument);
    var jobFolder = new JobFolder(job.nfo.folder);
    var monoPrints = jobFolder.get_prints();

    mockup.place_prints_on_page (monoPrints);

    mockup.add_preview_page();
    
    //mockup.save();
};

main();