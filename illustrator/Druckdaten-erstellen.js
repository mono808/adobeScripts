//@target illustrator
//@include "require.js"

function main(report) {
    var f_all = require("f_all");
    var AiBase = require("AiBase");
    var job = require("job");
    var paths = require("paths");
    var saveOptions = require("saveOptions");

    job.set_nfo(null, true, false);
    paths.set_nfo(job.nfo);

    //-------------------------------------------------------
    var aiDoc = new AiBase(app.activeDocument);

    aiDoc.fit_artboard_to_art("Motiv");

    //job.nfo.wxh = aiDoc.get_wxh();

    aiDoc.delete_layer("BG");

    aiDoc.delete_layer("HilfsLayer");

    // save print file

    var printFile;
    var printSaveOpts;
    switch (job.nfo.tech.toLowerCase()) {
        case "flx":
            printFile = paths.file("flxPrintAi");
            printSaveOpts = saveOptions.workingAi();
            break;
        case "flo":
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
}

main();
