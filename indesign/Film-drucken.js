//@target indesign
//@include "require.js"

(function () {
    if (!app.activeDocument) {
        alert("Bitte Filmdatei zuerst öffnen");
        return;
    }

    var paths = require("paths");
    var MonoFilm = require("MonoFilm");

//~     var job = require("job");
//~     var print = require("print");
//~     var jobNfo = job.get_jobNfo(app.activeDocument);
//~     var printNfo = print.get_printNfo(jobNfo.file);
//~     paths.set_nfo(jobNfo);
//~     paths.set_nfo(printNfo);

    var myDoc = app.activeDocument;

    var monoFilm = new MonoFilm(myDoc);

    monoFilm.print(paths.path("filmIn"), paths.path("filmOut"));

    app.activeDocument.save();
})();
