//@target indesign
//@include "require.js"
$.level = 1;

(function () {
    if (app.selection.length < 1) {
        alert("Please open a document first");
        return;
    }

    var texTool = require("textilTool");

    //texTool.add_textile();
    //
    texTool.reactivate_jpg(app.selection);
    texTool.reactivate_layers(app.selection);

    // var msg = "Textil als JPG einbetten?";
    // var flatten = Window.confirm(msg, true, "Einbetten?");

    // if (flatten) {
    //     texTool.flatten_textile(app.selection);
    // }
})();
