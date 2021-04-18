//@target illustrator
//@include "require.js"

function main() {
    var typeahead = require("typeahead");
    var paths = require("paths");

    function isFile(aFile) {
        return aFile.constructor.name === "File";
    }

    var templates = paths.folder("templates").getFiles(isFile);
    templates.sort();

    var filesToOpen = typeahead.show_dialog(templates, "displayName");

    for (var i = 0; i < filesToOpen.length; i++) {
        app.open(filesToOpen[i]);
    }
}

main();
