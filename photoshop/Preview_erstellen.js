
//@include "require.js"
$.level = 0;
(function () {
    var job = require("job");
    var print = require("print");
    var paths = require("paths");
    var iaSwitch = require("interactionSwitch");
    var PsSiebdruckPreview = require("PsSiebdruckPreview");

    var jobNfo = job.get_jobNfo_from_doc(app.activeDocument);
    var printNfo = print.get_printNfo(jobNfo.file);
    paths.set_nfo(jobNfo);
    paths.set_nfo(printNfo);

    iaSwitch.set("none");

    var saveFile = paths.file("previewPs");

    var previewDoc = new PsSiebdruckPreview(app.activeDocument);
    previewDoc.make(saveFile);

    app.refresh();

    iaSwitch.reset();
})();
