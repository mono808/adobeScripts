/*
This script gos through the selected Items / all pathItems
and adds all used fill & strokecolors to the swatches palette as a global color
*/

//@target illustrator

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

function check_spots(doc, color) {
    var spots = _fp.make_array(doc.spots);
    var included = spots.some(function (spot) {
        var compare_colors = compare_wrapper(spot.color);
        return compare_colors(color);
    });
    return included;
}

function create_spot_name(color) {
    var values = [];
    for (var key in color) {
        if (Object.hasOwnProperty.call(color, key) && typeof color[key] == "number") {
            values.push(key[0].toUpperCase() + "=" + color[key].toFixed(0));
        }
    }
    var spotName = values.join(" ");
    return spotName;
}

function create_spotColor(doc, color) {
    var spot = doc.spots.add();
    spot.name = create_spot_name(color);
    spot.color = color;
    spot.colorModel = ColorModel.PROCESS;

    var spotColor = new SpotColor();
    spotColor.spot = spot;
    spotColor.tint = 100;
    return spotColor;
}

function main() {
    var doc = app.activeDocument;
    var sel;
    if (app.selection.length > 0) {
        sel = _fp.make_array(doc.selection);
    } else {
        sel = _fp.make_array(doc.pathItems);
    }

    sel.forEach(function (pI) {
        var myColor, spotColor;
        if (pI.filled) {
            myColor = pI.fillColor;
            if (!check_spots(doc, myColor)) {
                spotColor = create_spotColor(doc, myColor);
                pI.fillColor = spotColor;
            }
        }
        if (pI.stroked) {
            myColor = pI.strokeColor;
            if (!check_spots(doc, myColor)) {
                spotColor = create_spotColor(doc, myColor);
                pI.strokeColor = spotColor;
            }
        }
    });
}

main();
