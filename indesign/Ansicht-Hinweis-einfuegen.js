//@target indesign
//@include "require.js"

(function () {
    if (!app.activeDocument) {
        alert("Bitte zuerst Filmdatei öffnen");
        return;
    }

//~     var job = require("job");
//~     var paths = require("paths");
    var MonoMockup = require("MonoMockup");

//~     var jobNfo = job.set_nfo(null, false);
//~     paths.set_nfo(jobNfo);

    var mockup = new MonoMockup(app.activeDocument);
    mockup.add_hinweis();
})();
