//@target indesign
//@include "require.js"

(function () {
    var job = require("job");
    var paths = require("paths");

    var jobNfo = job.get_jobNfo(app.activeDocument);

    paths.set_nfo(jobNfo);

    var MonoMockup = require("MonoMockup");
    var MonoTable = require("MonoTable");

    var monoMockup = new MonoMockup();
    monoMockup.init(app.activeDocument);

    var myPage = app.activeWindow.activePage;
    var monoGraphics = monoMockup.get_monoGraphics(myPage, monoMockup.layers.prints);

    var monoTable = new MonoTable(myPage);
    monoTable.create_table(myPage, true);

    for (var i = 0; i < monoGraphics.length; i++) {
        monoTable.add_row(monoGraphics[i]);
    }
})();
