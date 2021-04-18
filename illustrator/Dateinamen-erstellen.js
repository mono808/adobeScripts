//@target illustrator
//@include "require.js"

function main() {
    //var f_all = require("f_all");
    var paths = require("paths");
    var saveOptions = require("saveOptions");
    var job = require("job");
    var print = require("print");
    var BaseDoc = require("BaseDoc");

    var jobNfo = job.get_jobNfo_from_doc(app.activeDocument);
    var printNfo = print.get_printNfo(jobNfo.file);
    paths.set_nfo(jobNfo);
    paths.set_nfo(printNfo);

    var baseDoc = new BaseDoc(app.activeDocument);
    baseDoc.save_doc(paths.file("workingAi"), saveOptions.sdPrintAi(), false);
}

if (app.documents.length > 0) {
    main();
} else {
    alert("No open Document!");
}
