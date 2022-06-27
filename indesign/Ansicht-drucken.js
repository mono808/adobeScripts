//@target indesign
//@include "require.js"

(function () {
    var interactSwitch = require("InteractionSwitch");
    interactSwitch.set("all");

    var printPreset;
    printPreset = app.printerPresets.item("printMockup");

    var doc;
    if (app.documents.length > 0 && app.activeDocument) {
        doc = app.activeDocument;
    } else {
        doc = open_mockup();
    }
    if (!doc) return;

    var pageWidth = doc.documentPreferences.pageWidth;
    var scale = (297 / pageWidth) * 100;

    printPreset.scaleMode = ScaleModes.SCALE_WIDTH_HEIGHT;
    printPreset.scaleProportional = true;
    printPreset.scaleWidth = scale;
    printPreset.tile = false;
    printPreset.pagePosition = PagePositions.CENTERED;

    doc.print(false, printPreset);
    //doc.close(SaveOptions.NO);

    interactSwitch.set("all");

    function open_mockup() {
        var job = require("job");
        var paths = require("paths");

        var jobNfo = job.get_jobNfo();

        if (!jobNfo) return;
        paths.set_nfo(jobNfo);
        var mockupFile = paths.file("mockUpIndd");
        if (mockupFile.exists) {
            return app.open(mockupFile);
        } else {
            return null;
        }
    }
})();
