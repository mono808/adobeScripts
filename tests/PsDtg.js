//@target photoshop
//@include "require.js"

function setup(input) {
    var scriptDir = $.fileName.substring(0, $.fileName.lastIndexOf("/"));
    var inputFile = new File(scriptDir + "/input/" + input);
    app.open(inputFile);
}

function main(testee, output, saveOpts) {
    var TestDoc = require(testee);
    var saveOptions = require("saveOptions");
    var saveOptsFunction = saveOptions[saveOpts];

    var scriptDir = $.fileName.substring(0, $.fileName.lastIndexOf("/"));
    var outputFile = new File(scriptDir + "/output/" + output);

    var testDoc = new TestDoc(app.activeDocument);

    testDoc.make(outputFile, saveOptsFunction());
}

function tearDown() {
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

var testee = "PsDTG";
var saveOpts = "dtgPrintPS";

var input = "PsDtg.tif";
var output = input;
var closeDoc = true;

//~ setup(input);
//~ main(testee, output, saveOpts);
//~ tearDown(closeDoc);

//~ var input = 'PsDtg16bit.tif';
//~ var output = input;
//~ var closeDoc = true;

//~ setup(input);
//~ main(testee, output, saveOpts);
//~ tearDown(closeDoc);

//~ var input = 'PsDtgLab.tif';
//~ var output = input;
//~ var closeDoc = true;

//~ setup(input);
//~ main(testee, output, saveOpts);
//~ tearDown(closeDoc);

//~ var input = 'PsDtg16bitLab.tif';
//~ var output = input;
//~ var closeDoc = true;

//~ setup(input);
//~ main(testee, output, saveOpts);
//~ tearDown(closeDoc);

var input = "PsDtgSpot.tif";
var output = input;
var closeDoc = true;

setup(input);
main(testee, output, saveOpts);
tearDown(closeDoc);
