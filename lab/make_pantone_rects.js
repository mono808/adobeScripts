//@include "require.js"

var _fp = require("_fp");

var doc = app.activeDocument;
var swatches = _fp.make_array(doc.swatches);

function make_rect(t, l, h, w, fillColor) {
    var rect = doc.pathItems.rectangle(t, l, h, w);
    rect.fillColor = fillColor;
    rect.stroked = false;
    return rect;
}
var maxColumns = 7;
var rectangleSize = 10;
var top = 0;
var left = 0;
swatches.forEach(function (swatch, index) {
    var mod = index % maxColumns;
    left = mod;
    if (mod === 0) {
        top++;
    }
    make_rect(
        top * rectangleSize,
        left * rectangleSize,
        rectangleSize,
        rectangleSize,
        swatch.color
    );
});
