//@target indesign

function addPasser() {
    function show_dialog() {
        var result;

        var win = new Window("dialog", "monos Passer-Script");
        win.setPnl = win.add("panel");
        win.setPnl.center = win.setPnl.add("button", undefined, "Center");
        win.setPnl.quer = win.setPnl.add("button", undefined, "Quer");
        win.setPnl.hoch = win.setPnl.add("button", undefined, "Hoch");

        win.setPnl.center.onClick = function () {
            result = "center";
            win.close();
        };
        win.setPnl.quer.onClick = function () {
            result = "quer";
            win.close();
        };
        win.setPnl.hoch.onClick = function () {
            result = "hoch";
            win.close();
        };

        win.show();
        return result;
    }

    function Passer(x, y, name, settings) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.settings = settings;
    }

    function initPasserWide(passerSettings) {
        var pS = passerSettings;
        var pB = {};
        pB.top = sepRef.geometricBounds[0] - pS.distance - pS.diameter / 2;
        pB.left = sepRef.geometricBounds[1] + pS.diameter / 2;
        pB.bottom = sepRef.geometricBounds[2] + pS.distance + pS.diameter / 2;
        pB.right = sepRef.geometricBounds[3] - pS.diameter / 2;

        var passerArray = [];
        passerArray.push(
            new Passer(pB.left, pB.top, "lefttop", passerSettings)
        );
        passerArray.push(
            new Passer(pB.right, pB.top, "righttop", passerSettings)
        );
        passerArray.push(
            new Passer(pB.left, pB.bottom, "leftbottom", passerSettings)
        );
        passerArray.push(
            new Passer(pB.right, pB.bottom, "rightbottom", passerSettings)
        );

        return passerArray;
    }

    function initPasserPortrait(passerSettings) {
        var pS = passerSettings;
        var pB = {};
        pB.top = sepRef.geometricBounds[0] + pS.diameter / 2;
        pB.left = sepRef.geometricBounds[1] - pS.distance - pS.diameter / 2;
        pB.bottom = sepRef.geometricBounds[2] - pS.diameter / 2;
        pB.right = sepRef.geometricBounds[3] + pS.distance + pS.diameter / 2;

        var passerArray = [];
        passerArray.push(
            new Passer(pB.left, pB.top, "lefttop", passerSettings)
        );
        passerArray.push(
            new Passer(pB.right, pB.top, "righttop", passerSettings)
        );
        passerArray.push(
            new Passer(pB.left, pB.bottom, "leftbottom", passerSettings)
        );
        passerArray.push(
            new Passer(pB.right, pB.bottom, "rightbottom", passerSettings)
        );

        return passerArray;
    }

    function initPasserCenter(passerSettings) {
        var pS = passerSettings;
        var vLine = myDoc.guides.item("vLine"),
            passerArray = [],
            x = vLine.location,
            y;

        //center top passer
        y = sepRef.geometricBounds[0] - pS.distance - pS.diameter / 2;
        passerArray.push(new Passer(x, y, "centertop", passerSettings));

        //center bottom passer
        y = sepRef.geometricBounds[2] + pS.distance + pS.diameter / 2;
        passerArray.push(new Passer(x, y, "centerbottom", passerSettings));

        return passerArray;
    }

    function draw_passer(passer) {
        var pS = passer.settings;
        var myLayer = app.activeDocument.activeLayer;
        var pGroup = [],
            passerGraphic,
            x = passer.x,
            y = passer.y;

        var circle = myPage.ovals.add(myLayer, undefined, undefined, {
            strokeWeight: pS.stroke2,
            fillColor: noColor,
            strokeColor: regColor,
            geometricBounds: [
                y - pS.circle / 2,
                x - pS.circle / 2,
                y + pS.circle / 2,
                x + pS.circle / 2
            ]
        });
        var gLH = myPage.graphicLines.add(myLayer, undefined, undefined, {
            strokeWeight: pS.stroke2,
            fillColor: noColor,
            strokeColor: regColor,
            geometricBounds: [y, x - pS.circle / 2, y, x + pS.circle / 2]
        });
        var gLV = myPage.graphicLines.add(myLayer, undefined, undefined, {
            strokeWeight: pS.stroke2,
            fillColor: noColor,
            strokeColor: regColor,
            geometricBounds: [y - pS.circle / 2, x, y + pS.circle / 2, x]
        });
        var gLHhair = myPage.graphicLines.add(myLayer, undefined, undefined, {
            strokeWeight: pS.stroke1,
            fillColor: noColor,
            strokeColor: regColor,
            geometricBounds: [y, x - pS.diameter / 2, y, x + pS.diameter / 2]
        });
        var gLVhair = myPage.graphicLines.add(myLayer, undefined, undefined, {
            strokeWeight: pS.stroke1,
            fillColor: noColor,
            strokeColor: regColor,
            geometricBounds: [y - pS.diameter / 2, x, y + pS.diameter / 2, x]
        });

        pGroup.push(circle, gLH, gLHhair, gLV, gLVhair);
        passerGraphic = myPage.groups.add(pGroup);
        passerGraphic.name = passer.name;

        return passerGraphic;
    }

    ///////////////////////////////////////////
    //     Start Script
    ///////////////////////////////////////////

    var dialogResult = show_dialog();
    if (!dialogResult) {
        alert("Script cancelled!");
        return;
    }

    var myDoc = app.activeDocument;
    var myPage = myDoc.pages.item(0);
    var regColor = myDoc.colors.item("Registration");
    var noColor = myDoc.swatches.item("None");

    try {
        var mLayer = myDoc.layers.item("motivEbene");
        var check = mLayer.name;
        mLayer.visible = false;
    } catch (e) {}

    try {
        myDoc.layers.item("infoEbene").name;
        var pLayer = myDoc.layers.item("infoEbene");
    } catch (e) {
        var pLayer = myDoc.layers.add({ name: "infoEbene" });
    } finally {
        myDoc.activeLayer = pLayer;
    }

    // Settings for Passer
    var centerPasserSettings = {
        stroke1: 0.25,
        stroke2: 0.6,
        circle: 4,
        diameter: 12,
        distance: 8
    };

    var sidePasserSettings = {
        stroke1: 0.25,
        stroke2: 0.25,
        circle: 2.5,
        diameter: 6,
        distance: 8
    };

    var sepRef = myDoc.allGraphics[0];

    // store measurementUnits, set to millimeters
    var oldXUnits =
        app.activeDocument.viewPreferences.horizontalMeasurementUnits;
    var oldYUnits = app.activeDocument.viewPreferences.verticalMeasurementUnits;
    app.activeDocument.viewPreferences.horizontalMeasurementUnits =
        MeasurementUnits.millimeters;
    app.activeDocument.viewPreferences.verticalMeasurementUnits =
        MeasurementUnits.millimeters;

    var i, maxI, passerArray;

    switch (dialogResult) {
        case "center":
            passerArray = initPasserCenter(centerPasserSettings);
            break;
        case "hoch":
            passerArray = initPasserWide(sidePasserSettings);
            break;
        case "quer":
            passerArray = initPasserPortrait(sidePasserSettings);
            break;
    }

    for (i = 0, maxI = passerArray.length; i < maxI; i += 1) {
        draw_passer(passerArray[i]);
    }

    try {
        mLayer.visible = true;
    } catch (e) {}

    // myMeasureSwitch.reset_units();
    app.activeDocument.viewPreferences.horizontalMeasurementUnits = oldXUnits;
    app.activeDocument.viewPreferences.verticalMeasurementUnits = oldYUnits;
    // viewPrefSwitch.reset();
}

addPasser();
