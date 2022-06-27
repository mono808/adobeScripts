//@target illustrator
//@include "require.js"

var myModule = require("BridgeTalker");

var args = {
    module: "ai_get-doc-infos",
    file: new File(ADOBESCRIPTS + "/tests/input/Sd.ai"),
    activeLayers: ["Motiv"]
};

var response = myModule.send_script("illustrator", args);

$.writeln("// TEST RESULT //");
$.writeln($.fileName);
$.writeln(response.toSource());
