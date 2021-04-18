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

    var job = require("job");
    var print = require("print");
    var paths = require("paths");
    var MonoFilm = require("MonoFilm");
    var MonoGraphic = require("MonoGraphic");

    var myDoc = app.activeDocument;

    for (var i = 0; i < myDoc.selection.length; i++) {
        var monoGraphic = new MonoGraphic(myDoc.selection[i].graphics[0]);
        var jobNfo = job.get_jobNfo_from_doc(monoGraphic.get_file("print"));
        var printNfo = print.get_printNfo(jobNfo.file);
        paths.set_nfo(jobNfo);
        paths.set_nfo(printNfo);

        var monoFilm = new MonoFilm();
        monoFilm.create_template();
        var sepFile = monoGraphic.get_file("print");
        var width = monoGraphic.get_width();
        var height = monoGraphic.get_height();
        var deltaX = monoGraphic.get_placement().deltaX;
        var rotation = monoGraphic.get_rotationAngle();
        monoFilm.place_sep(
            sepFile,
            width,
            height,
            deltaX,
            rotation
        );
        monoFilm.get_sep_type();
        monoFilm.add_centermarks();
        monoFilm.add_pictogram();
        monoFilm.add_spotInfo_numbered();
        monoFilm.add_jobInfo(jobNfo, printNfo);
        monoFilm.position_textFrames();
        monoFilm.resize_page();
        monoFilm.save(jobNfo, true, false);
        monoFilm.print(paths.path("filmIn"), paths.path("filmOut"));
    }
})();
