//@include "require.js"
$.level = 2;

function setup() {}

function main(modjsx) {
    var m = require(modjsx);

    var myFile = m.get_file();

    if (myFile) $.writeln(myFile.fullName || "nada");
    //$.writeln(result.constructor.name);
}

function tearDown() {}

main("recentFiles");
