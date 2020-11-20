//@include "require.js"
$.level = 1;

(function () {
    var recentFiles = require("recentFiles");

    var myFile = recentFiles.get_file();

    if (myFile) {
        app.open(myFile);
    }
})();
