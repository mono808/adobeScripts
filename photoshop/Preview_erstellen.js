﻿////@target photoshop

function main() {
    //@include "require.js"

    var job = require("job");
    var print = require("print");
    var paths = require("paths");
    var saveOptions = require("saveOptions");
    var iaSwitch = require("interactionSwitch");
    var PsSiebdruckPrint = require("PsSiebdruckPrint");
    var PsSiebdruckPreview = require("PsSiebdruckPreview");

    if (!app.activeDocument) return false;

    //make some checks to verify that the script can run
    var printDoc = new PsSiebdruckPrint(app.activeDocument);

    var pantoneChannels = printDoc.check_for_pantone();
    if (pantoneChannels.length > 0) {
        var alertStr = "";
        alertStr += "Dokument enthält Pantone-Farben in folgenden Kanälen:\n\n";
        alertStr += pantoneChannels.join("\n");
        alertStr += "\n\nBitte erst in RGB Farben wandeln!";
        alert(alertStr);
        return false;
    }

    if (printDoc.get_spot_channels().length < 1) {
        alert("Document contains no SpotColor Channels, script cancelled");
        return false;
    }

    var jobNfo = job.get_jobNfo_from_doc(app.activeDocument);
    var printNfo = print.get_printNfo(jobNfo.file);
    paths.set_nfo(jobNfo);
    paths.set_nfo(printNfo);

    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.MM;

    iaSwitch.set("none");

    //---------------------------------------------------------------------
    // create the preview file

    var saveFile = paths.file("previewPs");

    var previewDoc = new PsSiebdruckPreview(app.activeDocument);
    var previewSaveOpts = saveOptions.previewPs();
    previewDoc.make(saveFile, previewSaveOpts);

    app.preferences.rulerUnits = originalRulerUnits;
    iaSwitch.reset();
}

main();
