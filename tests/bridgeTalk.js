//@include "require.js"

var _ = require("_");

function testBT(myString) {
    $.writeln(BridgeTalk.appName + " says: " + myString);
    return "HOHOHO";
}

function myCallBack(resObj) {
    $.writeln("BridgeTalk result:" + resObj.body);
    var resVal = eval(resObj.body);
    $.writeln(BridgeTalk.appName + " calculates: " + resVal * 3);
}

_.BT_send_script("illustrator", testBT, "Shalalala", 0, myCallBack);
