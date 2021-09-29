//@target photoshop-120.064
//@include "require.js"

(function () {
    var PsDtg = require("PsDtg");
    var saveOptions = require("saveOptions");
    var iaSwitch = require("interactionSwitch");

    var job = require("job");
    var print = require("print");
    var paths = require("paths");

    var jobNfo = job.get_jobNfo_from_doc(app.activeDocument);
    
    var saveFile; 
    
    if(jobNfo) {
        var printNfo = print.get_printNfo(jobNfo.file);
        paths.set_nfo(jobNfo);
        paths.set_nfo(printNfo);
        saveFile = paths.file("dtgPrintTif");
        
    } else {        
        saveFile = File.saveDialog();
    }

    iaSwitch.set("none");

    var psDtg = new PsDtg(app.activeDocument);
    var saveOpts = saveOptions.dtgPrintPsTif();
    psDtg.make(saveFile, saveOpts);

    iaSwitch.reset();
})();
