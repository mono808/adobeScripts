//@target photoshop
//@include "require.js"

(function () {
    var f_all = require("f_all");
    var recentFolders = require("recentFolders");
    var myFile = recentFolders.get_file();

    if (!myFile) return;
    if (!(myFile instanceof File)) return;
    if (!myFile.exists) return;

    try {
        app.open(myFile);
    } catch (e) {
        f_all.alert_error(e);
    }
})();
