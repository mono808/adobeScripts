//@target photoshop-120.064
//@include "require.js"

function main() {
    var PsBase = require("PsBase");
    var job = require("job");
    var print = require("print");
    var paths = require("paths");
    var saveOptions = require("saveOptions");
    var psBase = new PsBase(app.activeDocument);

    var jobNfo = job.get_jobNfo_from_doc(app.activeDocument);
    var printNfo = print.get_printNfo(jobNfo.file);
    paths.set_nfo(jobNfo);
    paths.set_nfo(printNfo);

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
