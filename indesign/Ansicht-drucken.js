//@target indesign
//@include "require.js"

(function () {
    var interactSwitch = require("InteractionSwitch");
    interactSwitch.set("all");

    var printPreset;
    printPreset = app.printerPresets.item("printMockup");

    var doc = app.activeDocument;
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
})();
