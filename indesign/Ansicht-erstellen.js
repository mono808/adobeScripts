//@target indesign
//@include "require.js"

(function () {
    var job = require("job");
    var jobFolder = require("jobFolder");
    var paths = require("paths");
    var MonoMockup = require("MonoMockup");

    job.set_nfo(null, false);
    if (!job.nfo) return;
    paths.set_nfo(job.nfo);

    try {
        app.applyWorkspace("Ansichten");
    } catch (e) {
        $.writeln('could not load workspace "Ansichten"');
    }

    var mockup = new MonoMockup();

    mockup = mockup.create_mockupDoc();
    if (!mockup) return;

    mockup.init();

    mockup.import_empty_template();

    mockup.save_doc(paths.file("mockUpIndd"));

    mockup.show_shop_logo(job.nfo.shop);

    mockup.fill_job_infos(job.nfo);

    jobFolder.set_folder(job.nfo.folder);
    var monoPrints = jobFolder.get_prints();

    mockup.place_prints_on_page(monoPrints);

    mockup.add_preview_page();
})();
