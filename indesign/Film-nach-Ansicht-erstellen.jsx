//@target indesign
//@include 'require.jsx'

(function () {

    if(!app.activeDocument) {
        alert('Bitte Ansicht öffnen und Separation anwählen');
        return;
    }

    if(app.activeDocument.selection.length < 1) {
        alert('Bitte erst eine Grafik auswählen');
        return;
    }

    var job = require('job');
    var paths = require('paths');
    var MonoFilm = require('MonoFilm');
    var MonoGraphic = require('MonoGraphic');

    var myDoc = app.activeDocument;

    for (var i = 0; i < myDoc.selection.length; i++) {
        var monoGraphic = new MonoGraphic(myDoc.selection[i].graphics[0]);
        job.set_nfo(monoGraphic.get_file('print'), true, false);
        paths.set_nfo(job.nfo);

        var monoFilm = new MonoFilm();
        monoFilm.create_template();
        monoFilm.place_sep(monoGraphic.get_file('print'), monoGraphic.get_width(), monoGraphic.get_height(), monoGraphic.get_placement().deltaX, monoGraphic.get_rotationAngle());
        monoFilm.get_sep_type();
        monoFilm.add_centermarks();
        monoFilm.add_pictogram();
        monoFilm.add_spotInfo_numbered();
        monoFilm.add_jobInfo(job);
        monoFilm.position_textFrames();
        monoFilm.resize_page();
        monoFilm.save(job);
        monoFilm.print(paths.path('filmIn'), paths.path('filmOut'));
    }
})();