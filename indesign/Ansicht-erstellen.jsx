//@target indesign
function main () {
    
    //@include 'require.jsx'
    
    var f_all = require('f_all');
    var saveOptions = require('saveOptions');
    var job = require('job');
    var jobFolder = require('jobFolder');
    var paths = require('paths');

    #include 'MonoPrint.jsx'
    #include 'MonoNamer.jsx'
    #include 'MonoFilm.jsx'
    #include 'MonoMockup.jsx'
    #include 'MonoSep.jsx'
    #include 'Typeahead.jsx'
    #include 'TexAdder.jsx'
    
    job.set_nfo(null,false);
    if(!job.nfo) return;
    paths.set_nfo(job.nfo);
    jobFolder.set_folder(job.nfo.folder);
    //var typeahead = new Typeahead();
    
    try{
        app.applyWorkspace('Ansichten');
    } catch(e) {
        $.writeln('could not load workspace "Ansichten"');
    }
    
    var mockup = new MonoMockup();
    
    mockup.create_mockupDoc();
    mockup.init();
    mockup.import_pages();

    mockup.save();

    mockup.show_shop_logo(job.nfo.shop);
    mockup.fill_job_infos(job.nfo);

    var monoPrints = jobFolder.get_prints();

    mockup.place_prints_on_page (monoPrints);

    mockup.add_preview_page();
    
    //mockup.save();
};

main();
