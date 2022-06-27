//@target photoshop-120.064
//@include "require.js"

var testee = require("ps_get-doc-infos");

var args = {
    file: new File(ADOBESCRIPTS + "/tests/input/Sd.psd"),
    activeLayers: []
};

var response = testee.main(args);
$.writeln("// TEST RESULT //");
$.writeln($.fileName);
$.writeln(response.toSource());
