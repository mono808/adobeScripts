//@include "require.js"

var _fp = require("_fp");

function compare_props(obj1, obj2) {
    for (var key in obj1) {
        if (Object.hasOwnProperty.call(obj1, key)) {
            if (obj1[key] != obj2[key]) return false;
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

function main(myArgs) {
    //get arguments
    myArgs = eval(myArgs);
    var docFile = myArgs.file;
    var currentLayers = myArgs.layers;

    var doc = app.open(docFile);

    //make array of pathItems
    var pathItems = _fp.make_array(doc.pathItems);

    // filter pathItems that are not hidden and on the requested layers
    var currentPathItems = pathItems.filter(function (pI) {
        return !pI.hidden && currentLayers.includes(pI.layer.name);
    });

    // get all colors used in those pathItems
    var usedColors = [];
    currentPathItems.forEach(function (pI) {
        var color = pI.fillColor;
        if (color.typename != "NoColor") usedColors.push(color);
        color = pI.strokeColor;
        if (color.typename != "NoColor") usedColors.push(color);
    });

    // remove duplicate colors
    var uniqueColors = usedColors.reduce(function (accum, color) {
        var compare = compare_wrapper(color);
        if (!accum.some(compare)) {
            accum = _fp.save_push(accum, color);
        }
        return accum;
    }, []);

    // get all swatches in document
    var swatches = _fp.make_array(doc.swatches);

    // filter to swatches whose colors are included in uniqueColors
    var usedSwatches = swatches.filter(function (swatch) {
        var color = swatch.color;
        var compare = compare_wrapper(color);
        return uniqueColors.some(compare);
    });

    // return array of swatch names
    var response = usedSwatches.map(function (swatch) {
        return swatch.name;
    });

    doc.close();

    return response;
}
