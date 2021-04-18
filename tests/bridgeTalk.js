//@include "require.js"

var f_all = require("f_all");

function testBT(myString) {
    $.writeln(BridgeTalk.appName + " says: " + myString);
    return "HOHOHO";
}

function myCallBack(resObj) {
    $.writeln("BridgeTalk result:" + resObj.body);
    var resVal = eval(resObj.body);
    $.writeln(BridgeTalk.appName + " calculates: " + resVal * 3);
}

f_all.BT_send_script("illustrator", testBT, "Shalalala", 0, myCallBack);
