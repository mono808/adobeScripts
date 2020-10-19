//@include 'require.jsx'
//@target indesign


function setup() {
    app.documents.everyItem().close(SaveOptions.NO);
//~     var scriptDir = $.fileName.substring(0, $.fileName.lastIndexOf('/'));
//~     var inputFile = new File(scriptDir + '/input/mockup.indd');
//~     app.open(inputFile);
}

function main(modjsx) {

    var f_all = require('f_all');
    var saveOptions = require('saveOptions');
    var job = require('job');
    var jobFolder = require('jobFolder');
    var paths = require('paths');
    var names = require('names');
    var jobFolder = require('jobFolder');
    var MonoMockup = require('MonoMockup');
    var texTool = require('textilTool');
    
    var MonoPrint = require('MonoPrint');
    var MonoFilm = require('MonoFilm');
    var MonoSep = require('MonoSep');

    job.set_nfo(null,false);
    if(!job.nfo) return;
    paths.set_nfo(job.nfo);
    
    try{
        app.applyWorkspace('Ansichten');
    } catch(e) {
        $.writeln('could not load workspace "Ansichten"');
    }
    
    var mockup = new MonoMockup();
    
    mockup.create_mockupDoc();
    mockup.init();
    mockup.import_pages();

    mockup.save_doc(paths.file('mockUpIndd'));

    mockup.show_shop_logo(job.nfo.shop);
    mockup.fill_job_infos(job.nfo);

//  var mockup = new MonoMockup(app.activeDocument);
    jobFolder.set_folder(job.nfo.folder);
    var monoPrints = jobFolder.get_prints();

    mockup.place_prints_on_page (monoPrints);

    mockup.add_preview_page();
    
}

function tearDown () {
    app.activeDocument.close(SaveOptions.NO);
}

setup();
main();
tearDown();