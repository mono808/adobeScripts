//@target photoshop
//@include "require.js"

(function () {
    var _ = require("_");
    var recentFolders = require("recentFolders");
    var myFile = recentFolders.get_file();

    if (!myFile) return;
    if (!(myFile instanceof File)) return;
    if (!myFile.exists) return;

    try {
        app.open(myFile);
    } catch (e) {
        _.alert_error(e);
    }
})();
