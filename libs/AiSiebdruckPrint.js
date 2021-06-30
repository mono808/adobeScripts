var AiSiebdruck = require("AiSiebdruck");
var pantoneList = require("pantoneList");
var MonoSpot = require("MonoSpot");
var saveOptions = require("saveOptions");

function AiSiebdruckPrint(initDoc) {
    AiSiebdruck.call(this, initDoc);

    this.pantoneTxt = new File($.getenv("pcroot") + "/adobescripts/pantones.txt");
}
AiSiebdruckPrint.prototype = Object.create(AiSiebdruck.prototype);
AiSiebdruckPrint.prototype.constructor = AiSiebdruckPrint;

AiSiebdruckPrint.prototype.check = function (items) {
    //separationReport
    var suspItems = {
        nonSpotFills: [],
        nonSpotStrokes: [],
        spotStrokes: []
    };

    if (this.pathItems.length < 1 && this.rasterItems.length < 1 && this.pageItems.length < 1)
        return false;

    if (this.pathItems.length > 0) {
        var i = this.pathItems.length - 1;
        do {
            var pI = this.pathItems[i];
            // check fillcolor for spot / nonspot color
            switch (pI.fillColor.constructor.name) {
                case "GrayColor":
                case "LabColor":
                case "RGBColor":
                case "CMYKColor":
                case "PatternColor":
                    suspItems.nonSpotFills.push(pI);
                    if (pI.stroked && pI.strokeColor.constructor.name === "SpotColor") {
                        suspItems.spotStrokes.push(pI);
                    }
                    break;
                case "SpotColor":
                    // if pI has a stroke and is filled with sth. other than underbase spotcolor
                    // check the stroke too
                    if (
                        pI.stroked &&
                        pI.strokeColor.constructor.name !== "NoColor" &&
                        !this.ubRegEx.test(pI.fillColor.spot.name)
                    ) {
                        if (pI.strokeColor.constructor.name === "SpotColor") {
                            suspItems.spotStrokes.push(pI);
                        } else {
                            suspItems.nonSpotStrokes.push(pI);
                        }
                    }
                    break;
            }
        } while (i--);
    }

    if (
        suspItems.nonSpotFills.length == 0 &&
        suspItems.nonSpotStrokes.length == 0 &&
        suspItems.spotStrokes.length == 0
    )
        return true;

    var confirmer = function (suspItems) {
        for (var key in suspItems) {
            if (Object.hasOwnProperty.call(suspItems, key)) {
                var items = suspItems[key];
                if (items.length == 0) continue;
                app.selection = items;
                app.redraw();
                if (!Window.confirm("selected items contain " + key + "\n\nContinue?"))
                    return false;
            }
        }

        return true;
    };

    return confirmer(suspItems);
};

AiSiebdruckPrint.prototype.get_totalArea = function () {
    //               1                    +
    //   bounds:  0     2     values:  -     +
    //               3                    -

    var totalBounds = [];
    var initialized = false;

    for (var i = 0; i < this.spots.length; i++) {
        var spotChan = this.spots[i];
        if (!spotChan.isUB) {
            if (!initialized) {
                totalBounds = spotChan.bounds;
                initialized = true;
                continue;
            }

            var gB = spotChan.bounds;
            if (gB[0] < totalBounds[0]) totalBounds[0] = gB[0];
            if (gB[1] > totalBounds[1]) totalBounds[1] = gB[1];
            if (gB[2] > totalBounds[2]) totalBounds[2] = gB[2];
            if (gB[3] < totalBounds[3]) totalBounds[3] = gB[3];
        }
    }

    var totalArea = (totalBounds[2] - totalBounds[0]) * (totalBounds[1] - totalBounds[3]);
    this.totalBounds = totalBounds;
    this.totalArea = totalArea * this.sqpt2sqcm;
};

AiSiebdruckPrint.prototype.change_fillColor = function (itemsToCheck, oldSpot, newSpot) {
    var tempColor = new SpotColor();
    tempColor.spot = newSpot;

    var i = itemsToCheck.length - 1;
    var pI,
        tintValue,
        remainingItems = [];

    do {
        var pI = itemsToCheck[i];
        if (pI.fillColor.spot === oldSpot) {
            tintValue = pI.fillColor.tint;
            pI.fillColor = tempColor;
            pI.fillColor.tint = tintValue;
        } else {
            remainingItems.push(pI);
        }
    } while (i--);

    return remainingItems;
};

AiSiebdruckPrint.prototype.rename_pantone_colors = function () {
    for (var i = 0, maxI = this.doc.spots.length; i < maxI; i += 1) {
        var spot = this.doc.spots[i];
        var oldSpotName = spot.name;
        var newSpotName = pantoneList.rename_pantone(oldSpotName, spot.color);
        if (newSpotName != oldSpotName) {
            spot.name = newSpotName;
        }
    }
};

AiSiebdruckPrint.prototype.make = function (saveFile, saveOptions) {
    this.sort_by_spotColor(this.pathItems);

    this.fit_artboard_to_art("Motiv");

    this.delete_layer("BG");

    if (this.pathItems.length > 0) this.rename_pantone_colors(this.pathItems);

    // delete fluff and save final separation for film output
    app.doScript("Delete Fluff", "Separation");

    this.save_doc(saveFile, saveOptions, false);
};

module.exports = AiSiebdruckPrint;
