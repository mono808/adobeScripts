//@target indesign

function main () {
    
    //@include 'require.jsx'

    var f_all = require('f_all');
    var job = require('job');
    var jobFolder = require('jobFolder');
    var paths = require('paths');
    var names = require('names');
    
    var MonoMockup = require('MonoMockup');
    var MonoPrint = require('MonoPrint');
    var MonoFilm = require('MonoFilm');
    var MonoSep = require('MonoSep');
    var texTool = require('textilTool');
    var saveOptions = require('saveOptions');

    var job = new Job(null,false);
    if(!job.nfo) return;
    var pm = new Pathmaker(job.nfo);
    
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
