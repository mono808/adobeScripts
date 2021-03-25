//@target photoshop-120.064
//@include "require.js"

function main() {
    var PsBase = require("PsBase");
    var job = require("job");
    var paths = require("paths");
    var saveOptions = require("saveOptions");
    var psBase = new PsBase(app.activeDocument);

    job.get_job_nfo(null, true, false);
    job.get_print_nfo(job.nfo.ref);
    paths.set_nfo(job.nfo);

    psBase.save_doc(
        paths.file("workingPs"),
        saveOptions.workingPs(),
        false,
        true
    );
}

if (app.activeDocument) {
    main();
}
