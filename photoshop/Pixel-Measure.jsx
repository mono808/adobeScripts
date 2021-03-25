/*
Pixel Measure v0.04 - Photoshop script for adding pixel measurements to your mockups
Copyright (C) 2009 Nikolaj Selvik
added functionality to use the measurement scale to output user chosen units by mono808

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
//@target photoshop

app.displayDialogs = DialogModes.NO;

if (validateState()) {
    app.activeDocument.suspendHistory("Pixel Measure", "createMeasure();");
}

function validateState() {
    if (app.documents.length == 0) {
        alert("No document open");
        return false;
    }

    if (!hasSelection(app.activeDocument)) {
        alert("Please make a selection to measure");
        return false;
    }

    return true;
}

function find_good_offsets_horizontal(
    docRef,
    textLayerRef,
    width,
    textSize,
    x1,
    y1
) {
    var textWidth, textX, textY;
    var textItemRef = textLayerRef.textItem;
    textWidth = textLayerRef.bounds[2].value - textLayerRef.bounds[0].value;

    //check if text is within document borders
    textX = x1 + width / 2;
    if (textX - textWidth / 2 < 0) {
        textX = 1;
        textItemRef.justification = Justification.LEFT;
    } else if (textX + textWidth / 2 > docRef.width.value) {
        textX = docRef.width.value - 1;
        textItemRef.justification = Justification.RIGHT;
    }

    if (y1 + textSize < docRef.height.value) {
        textY = y1 + textSize;
    } else {
        textY = y1;
    }

    return Array(Math.floor(textX), Math.floor(textY));
}

function find_good_offset_vertical(
    docRef,
    textLayerRef,
    height,
    textSize,
    x1,
    y1
) {
    var textWidth, textX, textY;
    var textItemRef = textLayerRef.textItem;
    textWidth = textLayerRef.bounds[2].value - textLayerRef.bounds[0].value;

    //check if text is within document borders
    textX = x1 + textSize * 0.5;
    if (textX + textWidth > docRef.width.value) {
        textX = x1;
        textItemRef.justification = Justification.RIGHT;
    }

    textY = y1 + height / 2 + textSize * 0.5;

    return Array(Math.floor(textX), Math.floor(textY));
}

function setup() {
    var cmyk = app.foregroundColor.cmyk;
    cmyk.cyan = 0;
    cmyk.magenta = 100;
    cmyk.yellow = 0;
    cmyk.black = 0;
}

function createMeasure() {
    setup();

    var docRef = app.activeDocument;
    var selRef = docRef.selection;
    var mainLayerSet;

    var textSize = docRef.width;
    textSize.value *= 0.025;

    var logicalUnits = docRef.measurementScale.logicalUnits;
    var logicalLength = docRef.measurementScale.logicalLength;
    var pixelLength = docRef.measurementScale.pixelLength;
    var logicalRatio = logicalLength / pixelLength;

    // =======================================================
    // Create "Pixel Measures" LayerSet if it doesn't already exist
    // =======================================================
    try {
        mainLayerSet = docRef.layerSets.getByName("Pixel Measures");
    } catch (error) {
        mainLayerSet = docRef.layerSets.add();
        mainLayerSet.name = "Pixel Measures";
    }

    // =======================================================
    // Create Measurement LayerSet
    // =======================================================
    var layerSetRef = mainLayerSet.layerSets.add();
    var linesLayerRef = layerSetRef.artLayers.add();

    // =======================================================
    // Draw Lines
    // =======================================================

    var originalUnit = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.POINTS;

    var x1 = selRef.bounds[0].value;
    var y1 = selRef.bounds[1].value;
    var x2 = selRef.bounds[2].value;
    var y2 = selRef.bounds[3].value;

    var width = x2 - x1;
    var height = y2 - y1;

    app.preferences.rulerUnits = Units.PIXELS;

    var x1px = selRef.bounds[0].value;
    var y1px = selRef.bounds[1].value;
    var x2px = selRef.bounds[2].value;
    var y2px = selRef.bounds[3].value;

    var widthpx = x2px - x1px;
    var heightpx = y2px - y1px;

    app.preferences.rulerUnits = Units.POINTS;

    selRef.deselect();

    var horizontal = width > height;

    if (horizontal) {
        drawLine(x1, y1, x1, y1 + 20);
        drawLine(x2, y1, x2, y1 + 20);
        drawLine(x1, y1 + 10, x2, y1 + 10);
    } else {
        drawLine(x1, y1, x1 + 20, y1);
        drawLine(x1, y2, x1 + 20, y2);
        drawLine(x1 + 10, y1, x1 + 10, y2);
    }

    // =======================================================
    // Draw Text
    // =======================================================
    var textLayerRef = layerSetRef.artLayers.add();
    textLayerRef.kind = LayerKind.TEXT;

    var textItemRef = textLayerRef.textItem;
    textItemRef.size = textSize;
    textItemRef.antiAliasMethod = AntiAlias.NONE;

    if (horizontal) {
        var logicalWidth = (widthpx * logicalRatio).toFixed(0);
        textItemRef.contents = logicalWidth + " " + logicalUnits;
        textItemRef.justification = Justification.CENTER;

        textItemRef.position = find_good_offsets_horizontal(
            docRef,
            textLayerRef,
            width,
            textSize,
            x1,
            y1
        );
    } else {
        var logicalHeight = (heightpx * logicalRatio).toFixed(0);
        textItemRef.contents = logicalHeight + " " + logicalUnits;

        textItemRef.position = find_good_offset_vertical(
            docRef,
            textLayerRef,
            height,
            textSize,
            x1,
            y1
        );
    }

    layerSetRef.name = textItemRef.contents;

    textItemRef.color = app.foregroundColor;
    textItemRef.font = "ArialMT";

    // =======================================================
    // Reset
    // =======================================================
    app.preferences.rulerUnits = originalUnit;
}

function drawLine(x1, y1, x2, y2) {
    var pointArray = new Array();

    var pointA = new PathPointInfo();
    pointA.kind = PointKind.CORNERPOINT;
    pointA.anchor = Array(x1, y1);
    pointA.leftDirection = pointA.anchor;
    pointA.rightDirection = pointA.anchor;
    pointArray.push(pointA);

    var pointB = new PathPointInfo();
    pointB.kind = PointKind.CORNERPOINT;
    pointB.anchor = Array(x2, y2);
    pointB.leftDirection = pointB.anchor;
    pointB.rightDirection = pointB.anchor;
    pointArray.push(pointB);

    var line = new SubPathInfo();
    line.operation = ShapeOperation.SHAPEXOR;
    line.closed = false;
    line.entireSubPath = pointArray;

    var lineSubPathArray = new Array();
    lineSubPathArray.push(line);

    var linePath = app.activeDocument.pathItems.add(
        "TempPath",
        lineSubPathArray
    );
    linePath.strokePath(ToolType.PENCIL, false);
    app.activeDocument.pathItems.removeAll();
}

function hasSelection(doc) {
    var res = false;
    var as = doc.activeHistoryState;
    doc.selection.deselect();
    if (as != doc.activeHistoryState) {
        res = true;
        doc.activeHistoryState = as;
    }
    return res;
}
