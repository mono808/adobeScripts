//@target indesign
//@include "require.js"

(function () {
    if (app.selection.length < 1) {
        alert("Please select a textil first");
        return;
    }

    var texTool = require("textilTool");

    //texTool.add_textiles();
    //texTool.choose_object_layers(app.selection);
    texTool.flatten_textiles(app.selection);
})();
