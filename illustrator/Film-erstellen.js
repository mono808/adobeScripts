//@target illustrator
//@include "require.js"

function main(report) {
    var job = require("job");
    var paths = require("paths");
    var AiSiebdruckPrint = require("AiSiebdruckPrint");
    var AiSiebdruckPreview = require("AiSiebdruckPreview");
    var saveOptions = require("saveOptions");

    job.set_nfo(null, true, false);
    paths.set_nfo(job.nfo);

    var printDoc = new AiSiebdruckPrint(app.activeDocument);

    if (!printDoc.check()) return;

    var workingFile = paths.file("workingAi");
    var workingSaveOpts = saveOptions.workingAi();
    printDoc.save_doc(workingFile, workingSaveOpts, false);

    var printFile = paths.file("sdPrintAi");
    var printSaveOpts = saveOptions.sdPrintAi();
    printDoc.make(printFile, printSaveOpts);
    printDoc.place_on_film(printFile, printDoc.get_sep_coordinates());

    var previewDoc = new AiSiebdruckPreview(app.activeDocument);
    var previewFile = paths.file("previewAi");
    var previewSaveOpts = saveOptions.previewAi();
    previewDoc.make(previewFile, previewSaveOpts);
}

if (app.documents.length > 0) {
    main();
}
