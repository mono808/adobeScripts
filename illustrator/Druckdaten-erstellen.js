//@target illustrator
//@include "require.js"

(function () {
    // var f_all = require("f_all");
    var AiBase = require("AiBase");
    var job = require("job");
    var print = require("print");
    var paths = require("paths");
    var saveOptions = require("saveOptions");
    var runScriptModule = require("runscriptModule");

    var jobNfo = job.get_jobNfo_from_doc(app.activeDocument);
    var printNfo = print.get_printNfo(jobNfo.file);
    paths.set_nfo(jobNfo);
    paths.set_nfo(printNfo);

    //-------------------------------------------------------
    var workingFile = app.activeDocument.fullName;

    var baseDoc = new AiBase(app.activeDocument);
    baseDoc.save_doc(workingFile, saveOptions.workingAi());

    var aiDoc = new AiBase(app.activeDocument);
    var printFile;
    var printSaveOpts;
    switch (printNfo.tech.toLowerCase()) {
        case "flx":
            remove_stuff();
            printFile = paths.file("flxPrintAi");
            printSaveOpts = saveOptions.workingAi();
            aiDoc.save_doc(printFile, printSaveOpts);
            create_simple_preview();
            break;
        case "flo":
            remove_stuff();
            printFile = paths.file("floPrintAi");
            printSaveOpts = saveOptions.workingAi();
            aiDoc.save_doc(printFile, printSaveOpts);
            create_simple_preview();
            break;
        case "dtax":
            remove_stuff();
            printSaveOpts = saveOptions.ai_dta();
            aiDoc.save_doc(printFile, printSaveOpts);
            create_simple_preview();
            break;
        case "dtao":
            remove_stuff();
            printSaveOpts = saveOptions.ai_dta();
            aiDoc.save_doc(printFile, printSaveOpts);
            create_simple_preview();
            break;
        case "stk":
            remove_stuff();
            printFile = paths.file("stkPrintAi");
            printSaveOpts = saveOptions.workingAi();
            aiDoc.save_doc(printFile, printSaveOpts);
            create_simple_preview();
            break;
        case "sd":
            runScriptModule.run_script(ADOBESCRIPTS + "/illustrator/SD-Print-erstellen.js");
            runScriptModule.run_script(ADOBESCRIPTS + "/illustrator/SD-Preview-erstellen.js");
            break;
    }

    app.open(workingFile);

    function remove_stuff() {
        aiDoc.fit_artboard_to_art("Motiv");
        aiDoc.delete_layer("BG");
        aiDoc.delete_layer("HilfsLayer");
    }

    function create_simple_preview() {
        var aiDoc = new AiBase(app.activeDocument);
        aiDoc.delete_layer("Stuff");
        var previewFile = paths.file("previewAi");
        var previewSaveOpts = saveOptions.previewAi();
        aiDoc.save_doc(previewFile, previewSaveOpts, false);
    }
})();
