//@include "require.js"
//@target indesign
$.level = 1;

function setup() {
    app.documents.everyItem().close(SaveOptions.NO);

    var scriptDir = $.fileName.substring(0, $.fileName.lastIndexOf("/"));
    var inputFile = new File(scriptDir + "/input/mockup.indd");
    app.open(inputFile);
}

function main() {
    var texTool = require("textilTool");

    //texTool.add_textiles();

    texTool.choose_object_layers(app.selection);

    var msg = "Textil als JPG einbetten?";
    var flatten = Window.confirm(msg, true, "Einbetten?");

    if (flatten) {
        texTool.flatten_textiles(app.selection);
    }

    //texTool.reactivate_jpg(app.selection);
}

function tearDown() {
    app.activeDocument.close(SaveOptions.NO);
}

//setup();
main();
//tearDown();
