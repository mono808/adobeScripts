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

    // Film drucken
    var paths = require("paths");
    var scriptName = "indesign/Film-drucken.js";
    var scriptFile = new File(paths.pcroot + "/adobescripts/" + scriptName);
    app.doScript(scriptFile);
})();
