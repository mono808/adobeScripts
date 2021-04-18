//@target indesign
//@include "require.js"

(function () {
    var f_all = require("f_all");
    var jobFolder = require("jobFolder");
    var paths = require("paths");
    var names = require("names");

    var job = require("job");
    //var print = require("print");
    var jobNfo = job.get_jobNfo(app.activeDocument);
    //var printNfo = print.get_printNfo(jobNfo.ref);
    paths.set_nfo(jobNfo);
    //paths.set_nfo(printNfo);

    var MonoMockup = require("MonoMockup");
    var MonoTable = require("MonoTable");
    var saveOptions = require("saveOptions");

    var monoMockup = new MonoMockup();
    monoMockup.init(app.activeDocument);

    var myPage = app.activeWindow.activePage;
    var monoGraphics = monoMockup.get_monoGraphics(
        myPage,
        monoMockup.layers.prints
    );

    var monoTable = new MonoTable(myPage);
    monoTable.create_table(myPage, true);

    for (var i = 0; i < monoGraphics.length; i++) {
        monoTable.add_row(monoGraphics[i]);
    }
})();
