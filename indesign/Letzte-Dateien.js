//@include "require.js"
$.level = 1;

(function () {
    var recentFiles = require("recentFiles");

    var myFile = recentFiles.get_file_typeahead();

    if (myFile) {
        app.open(myFile);
    }
})();
