//@target indesign
//@include "require.js"

(function () {
    var job = require("job");
    var jobFolder = require("jobFolder");
    var paths = require("paths");
    var MonoMockup = require("MonoMockup");

    // job.set_nfo(null, false);
    // if (!job.nfo) return;
    // paths.set_nfo(job.nfo);

    var mockup = new MonoMockup();

    mockup.init();

    mockup.add_preview_page();
})();
