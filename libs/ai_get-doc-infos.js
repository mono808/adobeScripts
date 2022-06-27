//@include "require.js"

var _fp = require("_fp");

function compare_props(obj1, obj2) {
    for (var key in obj1) {
        if (Object.hasOwnProperty.call(obj1, key)) {
            if (obj1[key] !== obj2[key]) return false;
        }
    }
    return true;
}

function compare_wrapper(col1) {
    function compare_colors(col2) {
        if (col1.typename != col2.typename) return false;

        switch (col1.typename) {
            case "RGBColor":
            case "CMYKColor":
                return compare_props(col1, col2);
            case "SpotColor":
                return col1.spot.name === col2.spot.name;
            case "PatternColor":
                return col1.pattern.name === col2.pattern.name;
            case "GradientColor":
                return col1.gradient.name === col2.gradient.name;
        }
    }
    return compare_colors;
}

exports.main = function (myArgs) {
    //var myArgs = eval(stringArgs);
    var docFile = myArgs.file;
    var currentLayers = myArgs.activeLayers;

    if (!docFile.exists) return null;

    var doc = app.open(docFile);
    var response = {};

    // we are only interested in pathItems that are currently visible
    // and on the provided layers
    var pathItems = _fp.make_array(doc.pathItems);
    var currentPathItems = pathItems.filter(function (pI) {
        var onCurrentLayer = currentLayers.includes(pI.layer.name);
        var visible = !pI.hidden;
        return visible && onCurrentLayer;
    });

    // now get all colors that are used in those pathItems
    var usedColors = [];
    currentPathItems.forEach(function (pI) {
        var color = pI.fillColor;
        if (color.typename != "NoColor") usedColors.push(color);
        color = pI.strokeColor;
        if (color.typename != "NoColor") usedColors.push(color);
    });

    // and make them unique
    var uniqueColors = usedColors.reduce(function (accum, color) {
        var compare = compare_wrapper(color);
        if (!accum.some(compare)) {
            accum = _fp.safe_push(accum, color);
        }
        return accum;
    }, []);

    // now find all swatches that use those colors
    // so we can put a name on them
    var swatches = _fp.make_array(doc.swatches);
    var usedSwatches = swatches.filter(function (swatch) {
        var color = swatch.color;
        var compare = compare_wrapper(color);
        return uniqueColors.some(compare);
    });

    response.colors = usedSwatches.map(function (swatch) {
        return swatch.name;
    });

    // get the current dimensions of the document
    var width = Math.abs(doc.visibleBounds[2] - doc.visibleBounds[0]);
    var height = Math.abs(doc.visibleBounds[3] - doc.visibleBounds[1]);
    width = new UnitValue(width, "pt");
    height = new UnitValue(height, "pt");
    response.width = width.as("mm");
    response.height = height.as("mm");

    doc.close();

    return response;
};
