//@target indesign
//@include "require.js"

var passer = require("passer");

passer.add_passer();

var paths = require("paths");
var scriptName = "indesign/Film-zuschneiden.js";
var scriptFile = new File($.getenv("adobeScripts") + "/" + scriptName);
app.doScript(scriptFile);
