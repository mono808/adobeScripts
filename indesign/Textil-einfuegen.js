﻿//@target indesign
//@include "require.js"
$.level = 1;

(function () {
    if (!app.activeDocument) {
        alert("Please open a document first");
        return;
    }

    var texTool = require("textilTool");

    // TODO option to place front and back
    // TODO when front and back, choose same color for both

    texTool.add_textile(app.selection);
    // texTool.choose_object_layers(app.selection);

    // var msg = "Texti als JPG einbetten?";
    // var flatten = Window.confirm(msg, true, "Einbetten?");

    // if (flatten) {
    //     texTool.flatten_textile(app.selection);
    // }
})();
