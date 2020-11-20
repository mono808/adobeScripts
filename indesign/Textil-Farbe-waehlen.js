//@target indesign
//@include "require.js"
$.level = 1;

(function () {
    if (app.selection.length < 1) {
        alert("Please open a document first");
        return;
    }

    var texTool = require("textilTool");

    //texTool.add_textiles();
    texTool.choose_object_layers(app.selection);
    //texTool.flatten_textiles(app.selection);
})();
