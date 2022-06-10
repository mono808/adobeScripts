//@target indesign
//@include "require.js"
$.level = 1;

(function () {
    if (app.selection.length < 1) {
        alert("Please select an rectangle / graphic first");
        return;
    }

    var texTool = require("textilTool");

    //texTool.add_textile();
    texTool.choose_object_layers(app.selection);

    // var msg = "Textil als JPG einbetten?";
    // var flatten = Window.confirm(msg, true, "Einbetten?");

    // if (flatten) {
    //     texTool.flatten_textile(app.selection);
    // }
})();
