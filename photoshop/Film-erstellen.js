//@target photoshop

function main() {
    //@include "require.js"

    var job = require("job");
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

    job.set_nfo(app.activeDocument, true);
    paths.set_nfo(job.nfo);

    //---------------------------------------------------------------------
    // create the separation file

    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.MM;

    iaSwitch.set("none");

    var sepFormat = printDoc.get_sep_format();
    var saveFile, saveOpts;
    switch (sepFormat) {
        case "PSD":
            saveFile = paths.file("sdPrintPsd");
            saveOpts = saveOptions.sdPrintPsPsd();
            break;
        case "EPS":
            saveFile = paths.file("sdPrintEps");
            saveOpts = saveOptions.sdPrintPsEps();
            break;
    }

    printDoc.make(saveFile, saveOpts);

    var guidesLocation = printDoc.get_guide_location();
    printDoc.place_on_film(saveFile, guidesLocation);

    app.activeDocument = printDoc.sourceDoc;

    //---------------------------------------------------------------------
    // create the preview file

    saveFile = paths.file("previewPs");

    var previewDoc = new PsSiebdruckPreview(app.activeDocument);
    var previewSaveOpts = saveOptions.previewPs();
    previewDoc.make(saveFile, previewSaveOpts);

    app.preferences.rulerUnits = originalRulerUnits;
    iaSwitch.reset();
}

main();
