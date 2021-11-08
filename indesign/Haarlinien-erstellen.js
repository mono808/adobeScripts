//@target indesign
//@include "require.js"

function make_graphicLine(page, layer, linePoints, lineOptions) {
    var myLine = page.graphicLines.add(layer, LocationOptions.AT_BEGINNING, undefined, lineOptions);
    myLine.paths.item(0).pathPoints.item(0).anchor = linePoints[0];
    myLine.paths.item(0).pathPoints.item(1).anchor = linePoints[1];
}

function get_points(bounds, orientation, distance) {
    var linePoints = [];
    if (orientation == "horizontal" || orientation == "both") {
        var l1x1 = bounds[1];
        var l1y1 = bounds[0] - distance;
        var l1x2 = bounds[3];
        var l1y2 = l1y1;
        linePoints.push([
            [l1x1, l1y1],
            [l1x2, l1y2]
        ]);

        var l2x1 = bounds[1];
        var l2y1 = bounds[2] + distance;
        var l2x2 = bounds[3];
        var l2y2 = l2y1;
        linePoints.push([
            [l2x1, l2y1],
            [l2x2, l2y2]
        ]);
    }

    if (orientation == "vertical" || orientation == "both") {
        var l3x1 = bounds[1] - distance;
        var l3y1 = bounds[0];
        var l3x2 = l3x1;
        var l3y2 = bounds[2];
        linePoints.push([
            [l3x1, l3y1],
            [l3x2, l3y2]
        ]);

        var l4x1 = bounds[3] + distance;
        var l4y1 = bounds[0];
        var l4x2 = l4x1;
        var l4y2 = bounds[2];
        linePoints.push([
            [l4x1, l4y1],
            [l4x2, l4y2]
        ]);
    }

    return linePoints;
}

function get_selection_bounds(selection) {
    var selBounds = selection.reduce(function (collectionBounds, item) {
        item.visibleBounds.forEach(function (bound, idx) {
            var collectionBound = collectionBounds[idx];
            switch (idx) {
                case 0:
                case 1:
                    var min = Math.min(bound, collectionBound);
                    collectionBounds[idx] = min;
                    break;
                case 2:
                case 3:
                    var max = Math.max(bound, collectionBound);
                    collectionBounds[idx] = max;
                    break;
            }
        });
        return collectionBounds;
    }, selection[0].visibleBounds);
    return selBounds;
}

function myDialog() {
    var returnValue = {
        orientation: null,
        distance: null
    };

    var win = new Window("dialog", "Haarlinien erstellen", undefined);

    var editTextGroup = win.add("Group");
    editTextGroup.orientation = "row";

    var orientationGroup = win.add("Group");
    orientationGroup.orientation = "row";

    var verticalBtn = orientationGroup.add("Button", undefined, "vertical");
    var horizontalBtn = orientationGroup.add("Button", undefined, "horizontal");
    var bothBtn = orientationGroup.add("Button", undefined, "both");

    editTextGroup.add("statictext", undefined, "Distance (mm):");
    var editText = editTextGroup.add("edittext", undefined, "5mm");
    editText.characters = 10;

    verticalBtn.onClick = function () {
        returnValue.orientation = "vertical";
        returnValue.distance = editText.text;
        win.close();
    };

    horizontalBtn.onClick = function () {
        returnValue.orientation = "horizontal";
        returnValue.distance = editText.text;
        win.close();
    };

    bothBtn.onClick = function () {
        returnValue.orientation = "both";
        returnValue.distance = editText.text;
        win.close();
    };

    // Display the window
    win.show();

    return returnValue;
}

(function main() {
    if (app.documents.length < 1) return;
    var doc = app.activeDocument;

    if (app.selection.length < 1) return;
    var selection = app.selection;

    if (!app.activeWindow) return;
    var page = app.activeWindow.activePage;
    var layer = doc.activeLayer;

    var selectionBounds = get_selection_bounds(selection);

    var settings = myDialog();

    var distance = UnitValue(settings.distance);
    var linePoints = get_points(selectionBounds, settings.orientation, distance.as("mm"));

    var lineOptions = {
        strokeWeight: UnitValue("0.5 pt").value,
        fillColor: doc.swatches.item("None"),
        strokeColor: doc.colors.item("Registration")
    };
    linePoints.forEach(function (linePoints) {
        make_graphicLine(page, layer, linePoints, lineOptions);
    });
})();
