//@target illustrator
//@include "require.js"

function main() {
    //var f_all = require("f_all");
    var paths = require("paths");
    var saveOptions = require("saveOptions");
    var job = require("job");
    var BaseDoc = require("BaseDoc");

    job.get_job_nfo(null, true, false);
    job.get_print_nfo(job.nfo.ref);
    paths.set_nfo(job.nfo);

    var baseDoc = new BaseDoc(app.activeDocument);
    baseDoc.save_doc(paths.file("workingAi"), saveOptions.sdPrintAi(), false);
}

if (app.documents.length > 0) {
    main();
} else {
    alert("No open Document!");
}
