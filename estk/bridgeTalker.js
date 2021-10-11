//@include "require.js"

var bridgeTalker = require("BridgeTalker");

var result = bridgeTalker(
    "illustrator",
    new File("/c/monodev/adobescripts/illustrator/get-doc-colors.js"),
    {
        file: new File("/c/monodev/adobescripts/tests/input/colors.ai"),
        layers: ["testlayer1", "testlayer2"]
    }
);

$.writeln(result);
