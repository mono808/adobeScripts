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

    var jobNfo = job.get_jobNfo(app.activeDocument, false);
    paths.set_nfo(jobNfo);
    jobFolder.set_folder(jobNfo.folder);

    var mockup = new MonoMockup();
    mockup.init();

    var monoPrints = jobFolder.get_prints();

    mockup.place_prints_on_page(monoPrints);
}

main();
