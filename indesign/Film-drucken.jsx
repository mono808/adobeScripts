//@target indesign
//@include 'require.jsx'

(function () {

    if(!app.activeDocument) {
        alert('Bitte Filmdatei zuerst öffnen');
        return;
    }

    var job = require('job');
    var paths = require('paths');
    var MonoFilm = require('MonoFilm');

    job.set_nfo(null, false);
    paths.set_nfo(job.nfo);

    var myDoc = app.activeDocument;

    var monoFilm = new MonoFilm(myDoc);
    
    monoFilm.print(paths.path('filmIn'), paths.path('filmOut'));

    app.activeDocument.save();

})();