//@target indesign
//@include 'require.jsx'

(function () {

    var MonoFilm = require('MonoFilm');

    var monoFilm = new MonoFilm();
    
    try {
        app.applyWorkspace('Filme');
    } catch (e) {
        $.writeln('could not load workspace "Filme"');
    }

    monoFilm.create_template (false);

})();

