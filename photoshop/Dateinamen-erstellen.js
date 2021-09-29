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
    
    var close, showDialog, saveOpts, saveFile;  

    if(jobNfo) {
        var printNfo = print.get_printNfo(jobNfo.file);
        paths.set_nfo(jobNfo);
        paths.set_nfo(printNfo);
        saveOpts = saveOptions.workingPs();
        saveFile = paths.file("workingPs");
        close = false;
        showDialog = true;
        
    } else {
        saveOpts = saveOptions.workingPs();
        saveFile = File.saveDialog();
        close = false;
        showDialog = false;
    }

    psBase.save_doc(
        saveFile,
        saveOpts,
        close,
        showDialog
    );
}

if (app.activeDocument) {
    main();
}
