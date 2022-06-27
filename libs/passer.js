// Settings for Passer
var centerPasserSettings = {
    stroke1: 0.25,
    stroke2: 0.6,
    circle: 4,
    diameter: 10,
    distance: 12
};

var sidePasserSettings = {
    stroke1: 0.4,
    stroke2: 0.4,
    circle: 3.75,
    diameter: 9,
    distance: 12
};

function show_dialog() {
    var result;

    var win = new Window("dialog", "monos Passer-Script");
    win.setPnl = win.add("panel");
    win.setPnl.center = win.setPnl.add("button", undefined, "center");
    win.setPnl.lr = win.setPnl.add("button", undefined, "links-rechts");
    win.setPnl.aussen = win.setPnl.add("button", undefined, "aussen");
    win.setPnl.quer = win.setPnl.add("button", undefined, "quer");
    win.setPnl.hoch = win.setPnl.add("button", undefined, "hoch");
    win.setPnl.hoch = win.setPnl.add("button", undefined, "ohne");

    win.setPnl.center.onClick = function () {
        result = "center";
        win.close();
    };
    win.setPnl.lr.onClick = function () {
        result = "links-rechts";
        win.close();
    };
    win.setPnl.aussen.onClick = function () {
        result = "aussen";
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
    win.setPnl.hoch.onClick = function () {
        result = "ohne";
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

function getPasserBounds(passerLayout, passerSettings) {
    var sepRef = app.activeDocument.allGraphics[0];
    var bounds = {},
        pS = passerSettings;
    switch (passerLayout) {
        case "quer":
            bounds.top = sepRef.geometricBounds[0] + pS.diameter / 2;
            bounds.bottom = sepRef.geometricBounds[2] - pS.diameter / 2;
            bounds.left = sepRef.geometricBounds[1] - pS.distance;
            bounds.right = sepRef.geometricBounds[3] + pS.distance;
            break;
        case "hoch":
            bounds.top = sepRef.geometricBounds[0] - pS.distance;
            bounds.bottom = sepRef.geometricBounds[2] + pS.distance;
            bounds.left = sepRef.geometricBounds[1] + pS.diameter / 2;
            bounds.right = sepRef.geometricBounds[3] - pS.diameter / 2;
            break;
        case "aussen":
            bounds.top = sepRef.geometricBounds[0] - pS.distance;
            bounds.bottom = sepRef.geometricBounds[2] + pS.distance;
            bounds.left = sepRef.geometricBounds[1] - pS.distance;
            bounds.right = sepRef.geometricBounds[3] + pS.distance;
            break;
        case "links-rechts":
            bounds.top = sepRef.geometricBounds[0] + (sepRef.geometricBounds[2] - sepRef.geometricBounds[0]) / 2;
            bounds.bottom = bounds.top;
            bounds.left = sepRef.geometricBounds[1] - pS.distance;
            bounds.right = sepRef.geometricBounds[3] + pS.distance;
    }
    return bounds;
}

function initSidePasser(passerLayout, passerSettings) {
    var pB = getPasserBounds(passerLayout, passerSettings);

    var passerArray = [];
    if (passerLayout == "links-rechts") {
        passerArray.push(new Passer(pB.left, pB.top, "left-center", passerSettings));
        passerArray.push(new Passer(pB.right, pB.top, "right-center", passerSettings));
    } else {
        passerArray.push(new Passer(pB.left, pB.top, "lefttop", passerSettings));
        passerArray.push(new Passer(pB.right, pB.top, "righttop", passerSettings));
        passerArray.push(new Passer(pB.left, pB.bottom, "leftbottom", passerSettings));
        passerArray.push(new Passer(pB.right, pB.bottom, "rightbottom", passerSettings));
    }

    return passerArray;
}

function initPasserCenter(passerSettings) {
    var pS = passerSettings;
    var vLine = app.activeDocument.guides.item("vLine"),
        passerArray = [],
        x = vLine.location,
        y;
    var sepRef = app.activeDocument.allGraphics[0];

    //center top passer
    y = sepRef.geometricBounds[0] - pS.distance;
    passerArray.push(new Passer(x, y, "centertop", passerSettings));

    //center bottom passer
    y = sepRef.geometricBounds[2] + pS.distance;
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

    var myDoc = app.activeDocument;
    var myPage = myDoc.pages.item(0);
    var regColor = myDoc.colors.item("Registration");
    var noColor = myDoc.swatches.item("None");

    var circle = myPage.ovals.add(myLayer, undefined, undefined, {
        strokeWeight: pS.stroke2,
        fillColor: noColor,
        strokeColor: regColor,
        geometricBounds: [y - pS.circle / 2, x - pS.circle / 2, y + pS.circle / 2, x + pS.circle / 2]
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

exports.add_passer = function () {
    var oldXUnits = app.activeDocument.viewPreferences.horizontalMeasurementUnits;
    var oldYUnits = app.activeDocument.viewPreferences.verticalMeasurementUnits;
    var myDoc = app.activeDocument;

    try {
        var mLayer = myDoc.layers.item("motivEbene");
        mLayer.visible = false;
    } catch (e) {}

    var pLayer = app.activeDocument.layers.item("infoEbene");
    if (!pLayer.isValid) {
        pLayer = myDoc.layers.add({ name: "infoEbene" });
    }

    myDoc.activeLayer = pLayer;

    var dialogResult = show_dialog();
    if (!dialogResult) {
        alert("Script cancelled!");
        return;
    }

    app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
    app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;

    var i, maxI, passerArray;

    switch (dialogResult) {
        case "center":
            passerArray = initPasserCenter(centerPasserSettings);
            break;
        case "links-rechts":
            passerArray = initSidePasser("links-rechts", sidePasserSettings);
            break;
        case "hoch":
            passerArray = initSidePasser("hoch", sidePasserSettings);
            break;
        case "quer":
            passerArray = initSidePasser("quer", sidePasserSettings);
            break;
        case "aussen":
            passerArray = initSidePasser("aussen", sidePasserSettings);
            break;
        case "ohne":
            passerArray = [];
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
};
