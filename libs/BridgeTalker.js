function read_file(aFile) {
    if (aFile && aFile instanceof File && aFile.exists) {
        aFile.open("r", undefined, undefined);
        aFile.encoding = "UTF-8";
        aFile.lineFeed = "Windows";
        var success = aFile.read();
        aFile.close();
        return success;
    } else {
        alert(aFile + "could not be read");
    }
}

module.exports = function send_script(targetApp, scriptFile, scriptArguments) {
    var retval = true;
    var scriptString = read_file(scriptFile);

    // adding arguments to send to target
    scriptString += "var response = main(" + scriptArguments.toSource() + ");";

    // add serializing the response Object as last line of script, this will be received back onResult
    scriptString += "response.toSource();";

    // create the initial message object
    var btMsg = new BridgeTalk();
    btMsg.target = targetApp;
    // The string containing the script is the body
    btMsg.body = scriptString;

    // ESTK acknowledges the successful sending of the initial message
    btMsg.onResult = function (resObj) {
        $.writeln("result of sending script is " + resObj.body);
        retval = eval(resObj.body);
    };

    // ESTK handles any errors  that occur when sending the initial message
    btMsg.onError = function (errorMsg) {
        $.writeln(errorMsg.body);
        retval = false;
    };
    // ESTK sends the initial message
    $.writeln("Sending script to " + targetApp);

    btMsg.send(5000);

    $.writeln("BridgeTalk.send() invoked");

    return retval;
};
