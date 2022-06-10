//@target indesign
//@include "require.js"

(function () {
    if (!app.activeDocument) {
        alert("Bitte Ansicht öffnen und Separation anwählen");
        return;
    }

    if (app.activeDocument.selection.length < 1) {
        alert("Bitte erst eine Grafik auswählen");
        return;
    }

    var _ = require("_");
    var job = require("job");
    var print = require("print");
    var paths = require("paths");
    var MonoFilm = require("MonoFilm");
    var MonoGraphic = require("MonoGraphic");

    var myDoc = app.activeDocument;

    for (var i = 0; i < myDoc.selection.length; i++) {
        var monoGraphic = new MonoGraphic(myDoc.selection[i].graphics[0]);
        var jobNfo = job.get_jobNfo(monoGraphic.get_file("print"));
        var printNfo = print.get_printNfo(jobNfo.file);
        paths.set_nfo(jobNfo);
        paths.set_nfo(printNfo);

        var filmFile = monoGraphic.get_file("film");

        if (!_.validate_file_ref(filmFile)) {
            alert("Film File not found");
            return;
        }
        //Application.open (from:varies, showingWindow: Boolean , openOption: OpenOptions ):varies
        var filmDoc = app.open(filmFile, false);
        var monoFilm = new MonoFilm(filmDoc);

        monoFilm.print(paths.path("filmIn"), paths.path("filmOut"));

        filmDoc.close();
    }
})();
