//@target indesign
//@include "require.js"

(function () {
    var _ = require("_");
    var paths = require("paths");
    var job = require("job");

    var jobNfo = job.get_jobNfo();
    if (!jobNfo) return;

    paths.set_nfo(jobNfo);
    var mockupFile = paths.file("mockUpIndd");

    // if file does not exist, try selecting from parent folder.
    if (!_.validate_file_ref(mockupFile)) {
        mockupFile = File(mockupFile.parent).openDlg();
    }

    if(!mockupFile) return;

    app.open(mockupFile);
})();
