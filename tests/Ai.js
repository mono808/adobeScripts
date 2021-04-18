//@target illustrator

function setup(input) {
    var scriptDir = $.fileName.substring(0, $.fileName.lastIndexOf("/"));
    var inputFile = new File(scriptDir + "/input/" + input);
    app.open(inputFile);
}

function main(testee, output, saveOpts) {
    //@include "require.js"
    var TestDoc = require(testee);
    var saveOptions = require("saveOptions");
    var saveOptsFunction = saveOptions[saveOpts];

    var scriptDir = $.fileName.substring(0, $.fileName.lastIndexOf("/"));
    var outputFile = new File(scriptDir + "/output/" + output);

    var testDoc = new TestDoc(app.activeDocument);
    testDoc.make(outputFile, saveOptsFunction());
}

function tearDown() {
    app.activeDocument.close();
}

var testee = "AiSiebdruckPrint";
var input = "Sd.ai";
var output = "SdPrint.ai";
var saveOpts = "sdPrintAi";
var closeDoc = true;

setup(input);
main(testee, output, saveOpts);
tearDown(closeDoc);

var testee = "AiSiebdruckPreview";
var input = "Sd.ai";
var output = "SdPreview.ai";
var saveOpts = "previewAi";
var closeDoc = true;

setup(input);
main(testee, output, saveOpts);
tearDown(closeDoc);
