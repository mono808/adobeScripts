//@target indesign
//@include "require.js"

(function () {
    if (!app.activeDocument) {
        alert("Bitte Ansicht öffnen und Separation anwählen");
        return;
    }

    var MonoFilm = require("MonoFilm");

    var myFilm = new MonoFilm(app.activeDocument);

    myFilm.resize_page();
})();
