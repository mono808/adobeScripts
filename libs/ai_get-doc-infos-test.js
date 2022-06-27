//@target illustrator
//@include "require.js"

var testee = require("ai_get-doc-infos");

var args = {
    file: new File(ADOBESCRIPTS + "/tests/input/Sd.ai"),
    activeLayers: ["Motiv"]
};
var response = testee.main(args);
$.writeln("// TEST RESULT //");
$.writeln($.fileName);
$.writeln(response.toSource());
