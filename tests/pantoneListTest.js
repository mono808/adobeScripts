﻿//@include "require.js"

function setup() {}

function main() {
    var m = require("pantoneList");
    var p1 = "PANTONE 185 C";
    var p2 = "PANTONE 300 C";
    var p3 = "PANTONE Orange 021 C";
    var p4 = "PANTONE Process Blue C";

    // m.import_pantoneList();
    // m.import_pantoneList_legacy();
    var r1 = m.rename_pantone(p1);
    var r2 = m.rename_pantone(p2);
    var r3 = m.rename_pantone(p3);
    var r4 = m.rename_pantone(p4);

    $.writeln(r1 + "\r" + r2);
}

function tearDown() {}

main();
