//@target illustrator
//@include "require.js"

(function () {
    
    if (app.documents.length < 1) {
        alert("Please open a document first");
        return;
    }

    if (app.activeDocument.colorProfileName === "") {
        alert("Please assign a color profile!");
        return;
    }

    var job = require("job");
    var print = require("print");
    var paths = require("paths");
    var AiSiebdruckPrint = require("AiSiebdruckPrint");
    var AiSiebdruckPreview = require("AiSiebdruckPreview");
    var saveOptions = require("saveOptions");

    var jobNfo = job.get_jobNfo_from_doc(app.activeDocument);
    var printNfo = print.get_printNfo(jobNfo.file);
    paths.set_nfo(jobNfo);
    paths.set_nfo(printNfo);

    var printDoc = new AiSiebdruckPrint(app.activeDocument);

    if (!printDoc.check()) return;

    var workingFile = paths.file("workingAi");
    var workingSaveOpts = saveOptions.workingAi();
    printDoc.save_doc(workingFile, workingSaveOpts, false);

    var printFile = paths.file("sdPrintAi");
    var printSaveOpts = saveOptions.sdPrintAi();
    printDoc.make(printFile, printSaveOpts);
    printDoc.place_on_film(printFile, printDoc.get_sep_coordinates());

    if (!Window.confirm("PreviewDatei erstellen?")) return;

    var previewDoc = new AiSiebdruckPreview(app.activeDocument);
    var previewFile = paths.file("previewAi");
    var previewSaveOpts = saveOptions.previewAi();
    previewDoc.make(previewFile, previewSaveOpts);
})()
