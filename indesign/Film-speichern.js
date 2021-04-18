//@target indesign
//@include "require.js"

(function () {
    if (!app.activeDocument) {
        alert("Bitte zuerst Filmdatei öffnen");
        return;
    }

    var job = require("job");
    var paths = require("paths");
    var MonoFilm = require("MonoFilm");

    job.set_nfo(null, false);
    paths.set_nfo(job.nfo);

    var myDoc = app.activeDocument;

    var monoFilm = new MonoFilm(myDoc);

    myFilm.save(job, true, false);
})();
