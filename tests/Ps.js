//@target photoshop

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

var testee = "PsSiebdruckPrint";
var input = "Sd.psd";
var output = "SdPrint.psd";
var saveOpts = "sdPrintPsPsd";
var closeDoc = true;

setup(input);
main(testee, output, saveOpts);
tearDown(closeDoc);

var testee = "PsSiebdruckPreview";
var input = "Sd.psd";
var output = "SdPreview.psd";
var saveOpts = "previewPs";
var closeDoc = true;

setup(input);
main(testee, output, saveOpts);
tearDown(closeDoc);

var testee = "PsSiebdruckPrint";
var input = "Sd.psd";
var output = "SdPrint.eps";
var saveOpts = "sdPrintPsEps";
var closeDoc = true;

setup(input);
main(testee, output, saveOpts);
tearDown(closeDoc);
