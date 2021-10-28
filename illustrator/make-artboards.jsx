//@target illustrator
//@include "require.js"

function make_artboard(bounds) {
    var abs = app.activeDocument.artboards;
    var ab = abs.insert(bounds, abs.length);   
}

(function () {
    var _fp = require('_fp');
    var doc = app.activeDocument;
    var gIs = _fp.make_array(app.selection);

    gIs.forEach(function(gi) {
        make_artboard(gi.visibleBounds);
    })   
})()