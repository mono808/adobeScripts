//@target indesign
//@include "require.js"
$.level = 1;

function main() {
    if (!app.activeDocument) {
        alert("Please open a mockup document first");
        return;
    }

    var job = require("job");
    var jobFolder = require("jobFolder");
    var paths = require("paths");
    var names = require("names");

    var MonoMockup = require("MonoMockup");

    job.set_nfo(app.activeDocument, false);
    paths.set_nfo(job.nfo);
    jobFolder.set_folder(job.nfo.folder);

    var mockup = new MonoMockup();
    mockup.init();

    var monoPrints = jobFolder.get_prints();

    mockup.place_prints_on_page(monoPrints);
}

main();
