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

function run_module(stringArgs) {
    var myArgs = eval(stringArgs);
    var myModule = require(myArgs.module);
    var response = myModule.main(myArgs);
    $.writeln("run_module response is:");
    $.writeln(response.toSource());
    return response;
}

function build_string_module(scriptArguments) {
    var scriptString = '//@include "require.js"';
    scriptString += run_module.toString();
    scriptString += "var response = run_module(" + scriptArguments.toSource() + ");\n";
    scriptString += "response.toSource();";
    return scriptString;
}

function build_string_script(scriptArguments) {
    var scriptString = read_file(new File(scriptArguments.script));
    scriptString += "var response = main(" + scriptArguments.toSource() + ");\n";
    scriptString += "response.toSource();";
    return scriptString;
}

exports.send_script = function (targetApp, scriptArguments, onResult, onError) {
    var scriptString;
    if (scriptArguments.hasOwnProperty("module")) {
        scriptString = build_string_module(scriptArguments);
    } else {
        scriptString = build_string_script(scriptArguments);
    }

    // create the initial message object
    var response = null;

    var btMsg = new BridgeTalk();
    btMsg.target = targetApp;
    btMsg.body = scriptString;

    btMsg.onResult = function (resObj) {
        $.writeln("result of sending script is " + resObj.body);
        response = eval(resObj.body);
    };

    btMsg.onError = function (errorMsg) {
        $.writeln(errorMsg.headers);
        $.writeln(errorMsg.body);
    };

    // overwrite default callbacks if provided
    if (onResult) {
        $.writeln("provided onResult Callback for " + targetApp);
        btMsg.onResult = onResult;
    }
    if (onError) {
        $.writeln("provided onError Callback");
        btMsg.onError = onError;
    }

    // sends message synchronously and wait max 15s.
    $.writeln("Sending script to " + targetApp);
    btMsg.send(15);

    return response;
};
