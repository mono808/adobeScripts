//@target indesign
//@include "require.js"

(function () {
    if (!app.activeDocument) {
        alert("Bitte zuerst Filmdatei öffnen");
        return;
    }

    var job = require("job");
    var print = require("print");
    var paths = require("paths");
    var MonoFilm = require("MonoFilm");

    var jobNfo = job.get_jobNfo(app.activeDocument);
    var printNfo = print.get_printNfo(jobNfo.file);
    paths.set_nfo(jobNfo);
    paths.set_nfo(printNfo);

    var myDoc = app.activeDocument;

    var monoFilm = new MonoFilm(myDoc);
    var spots = monoFilm.get_all_spotColors();
    if (spots.length < 1) {
        alert("no spotcolors to put on film");
        return;
    }

    var motivLayer = myDoc.layers.item("motivEbene");
    if (motivLayer.isValid) {
        motivLayer.visible = false;
    }

    monoFilm.add_centermarks();

    monoFilm.add_pictogram();

    monoFilm.add_jobInfo(jobNfo, printNfo);

    monoFilm.add_spotInfo_numbered();

    monoFilm.position_textFrames();

    monoFilm.resize_page();

    //monoFilm.save(jobNfo, true, false);

    var scriptName = "indesign/Passer-erstellen.js";
    var scriptFile = new File(ADOBESCRIPTS + "/" + scriptName);
    app.doScript(scriptFile);

    if (motivLayer.isValid) {
        motivLayer.visible = true;
    }
    monoFilm.save(jobNfo, true, false);

    $.sleep(500);
    monoFilm.print(paths.path("filmIn"), paths.path("filmOut"));
})();
