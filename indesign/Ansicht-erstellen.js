//@target indesign
//@include "require.js"

(function () {
    var jobFolder = require("jobFolder");
    var paths = require("paths");
    var MonoMockup = require("MonoMockup");

    var job = require("job");
    var print = require("print");
    if(app.documents.length > 0 && app.activeDocument) {
        var jobNfo = job.get_jobNfo(app.activeDocument);
    } else {
        var jobNfo = job.get_jobNfo();
    }
    paths.set_nfo(jobNfo);
    
    //var printNfo = print.get_printNfo(jobNfo.ref);
    //paths.set_nfo(printNfo);

    // try {
    //     app.applyWorkspace("Ansichten");
    // } catch (e) {
    //     $.writeln('could not load workspace "Ansichten"');
    // }

    var mockup = new MonoMockup();

    mockup = mockup.create_mockupDoc();
    if (!mockup) return;

    mockup.init();

    mockup.import_empty_template();

    mockup.save_doc(paths.file("mockUpIndd"));

    mockup.show_shop_logo(jobNfo.shop);

    mockup.fill_job_infos(jobNfo);

    jobFolder.set_folder(jobNfo.folder);
    var monoPrints = jobFolder.get_prints();

    mockup.place_prints_on_page(monoPrints);

    mockup.add_preview_page();
})();
