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
    var spots = monoFilm.get_all_spotColors();
    if (spots.length < 1) {
        alert("no spotcolors to put on film");
        return;
    }

    try {
        myDoc.layers.item("motivEbene").visible = false;
    } catch (e) {}

    monoFilm.reset();

    monoFilm.add_centermarks();

    monoFilm.add_pictogram();

    monoFilm.add_jobInfo(job);

    monoFilm.add_spotInfo_numbered();

    monoFilm.position_textFrames();

    monoFilm.resize_page();

    try {
        myDoc.layers.item("motivEbene").visible = true;
    } catch (e) {}

    monoFilm.save(job, true, false);

    monoFilm.print(paths.path("filmIn"), paths.path("filmOut"));
})();
