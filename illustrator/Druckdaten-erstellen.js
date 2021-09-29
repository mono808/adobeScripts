//@target illustrator
//@include "require.js"

(function () {
    var f_all = require("f_all");
    var AiBase = require("AiBase");
    var job = require("job");
    var print = require("print");
    var paths = require("paths");
    var saveOptions = require("saveOptions");

    var jobNfo = job.get_jobNfo_from_doc(app.activeDocument);
    var printNfo = print.get_printNfo(jobNfo.file);
    paths.set_nfo(jobNfo);
    paths.set_nfo(printNfo);

    //-------------------------------------------------------
    var aiDoc = new AiBase(app.activeDocument);

    aiDoc.fit_artboard_to_art("Motiv");

    //jobNfo.wxh = aiDoc.get_wxh();

    aiDoc.delete_layer("BG");

    aiDoc.delete_layer("HilfsLayer");

    // save print file

    var printFile;
    var printSaveOpts;
    switch (printNfo.tech.toLowerCase()) {
        case "flx":
            printFile = paths.file("flxPrintAi");
            printSaveOpts = saveOptions.workingAi();
            break;
        case "flo":
            printFile = paths.file("floPrintAi");
            printSaveOpts = saveOptions.workingAi();
            break;
        case "dtax":
            printSaveOpts = saveOptions.ai_dta();
            break;
        case "dtao":
            printSaveOpts = saveOptions.ai_dta();
            break;
        case "stk":
            printFile = paths.file("stkPrintAi");
            printSaveOpts = saveOptions.workingAi();
            break;
    }

    // p.sdPrintAi
    // p.sdPrintEps
    // p.sdPrintPsd
    // p.dtaPrintPdf
    // p.dtaxPrintPdf
    // p.dtaoPrintPdf
    // p.floPrintAi
    // p.dtgPrintTi
    // p.stkPrintAi

    f_all.saveFile(printFile, printSaveOpts, false);

    // create preview file
    aiDoc.delete_layer("Stuff");

    var previewFile = paths.file("previewAi");
    var previewSaveOpts = saveOptions.previewAi();
    aiDoc.save_doc(previewFile, previewSaveOpts, false);

    app.open(printFile);
})();
