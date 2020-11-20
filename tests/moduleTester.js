//@include "require.js"

function setup() {}

function main(modjsx) {
    var m = require(modjsx);
    var p1 = "PANTONE 185 C";
    var p2 = "PANTONE Blue 072 C";
    var p3 = "PANTONE Orange 021 C";
    var p4 = "PANTONE Process Blue C";

    // m.import_pantoneList();
    // m.import_pantoneList_legacy();
    m.get_pantone_name(p1);
    m.get_pantone_name(p2);
}

function tearDown() {}

main("pantoneList");
