//@target photoshop-120.064
//@include "require.js"

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

function get_user_input() {
    var input = Window.prompt("enter length of selection in cm");
    return Number(input);
}

function calc_new_resolution(userDimension, selBounds, resolution) {
    var x1 = selBounds[0];
    var y1 = selBounds[1];
    var x2 = selBounds[2];
    var y2 = selBounds[3];

    var width = x2 - x1;
    var height = y2 - y1;

    var horizontal = width > height;

    var scaleFactor;
    if (horizontal) {
        scaleFactor = userDimension / width;
    } else {
        scaleFactor = userDimension / height;
    }

    var newReso = resolution / scaleFactor;
    return newReso;
}

(function () {
    if (!validateState()) return;
    var docRef = app.activeDocument;
    var selRef = docRef.selection;

    var userDimension = get_user_input();

    if(!userDimension) return;
    var originalUnit = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.CM;

    var selBounds = selRef.bounds.map(function (bound) {
        return bound.value;
    });

    var newResolution = calc_new_resolution(userDimension, selBounds, docRef.resolution);

    //Document.resizeImage (width: UnitValue , height: UnitValue , resolution: number , resampleMethod: ResampleMethod , amount:int)
    docRef.resizeImage(undefined, undefined, newResolution, ResampleMethod.NONE);

    // =======================================================
    // Reset
    // =======================================================
    app.preferences.rulerUnits = originalUnit;
})();
