﻿if (typeof Object.assign != "function") {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) {
            // .length of function is 2
            "use strict";
            if (target == null) {
                // TypeError if undefined or null
                throw new TypeError(
                    "Cannot convert undefined or null to object"
                );
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) {
                    // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (
                            Object.prototype.hasOwnProperty.call(
                                nextSource,
                                nextKey
                            )
                        ) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

exports.copy_props = function (targetObj, sourceObj, overwrite) {
    if (!targetObj || !sourceObj)
        throw new Error("provide two objects to copy properties");

    var targetCopy = Object.assign({}, targetObj);

    for (var p in sourceObj) {
        if (Object.prototype.hasOwnProperty.call(sourceObj, p)) {
            if (overwrite) {
                targetCopy[p] = sourceObj[p];
                continue;
            }

            if (!Object.prototype.hasOwnProperty.call(targetCopy, p)) {
                targetCopy[p] = sourceObj[p];
            }
        }
    }

    return targetCopy;
};

function makeCommand(string) {
    string = typeof string === "string" ? string : string.toString();
    var cmd = 'cmd.exe /c "echo ' + string + '|clip"';
    return cmd;
}

function reflect_props(obj) {
    var props = obj.reflect.properties;
    props.sort(function (a, b) {
        return a.name < b.name;
    });
    props.forEach(function (p) {
        $.writeln(p.name);
    });
}

function saveBAT(saveThis) {
    try {
        var pathToClipboardDoc = "~/Documents/copyToClipboard.bat";
        var myDataLog = new File(pathToClipboardDoc);
        myDataLog.open("w");
        myDataLog.writeln("@echo off");
        myDataLog.writeln("chcp 1252");
        myDataLog.writeln(saveThis);
        myDataLog.close();
        return myDataLog;
    } catch (err) {
        return null;
    }
}

exports.alert_error = function (e) {
    var msg = "Fehler:\r";
    msg += e.message;
    msg += "\r\rScript: " + e.fileName;
    msg += "\rZeile: " + e.line;
    alert(msg);
};

exports.BT_send_script = function (
    targetApp,
    script,
    scriptArgs,
    waitSec,
    callBack
) {
    var retval = true;

    // Create the message object
    var bt = new BridgeTalk();

    bt.target = targetApp;
    if (scriptArgs) {
        bt.body =
            "var SnpSentMessage = {}; SnpSentMessage.main = " +
            script.toString() +
            ";";
        bt.body += "var retval = SnpSentMessage.main(";
        bt.body += scriptArgs.toSource();
        $.writeln(scriptArgs.toSource());
        bt.body += ");";
        bt.body += "retval;";
    } else {
        bt.body = script.toString();
    }

    bt.onError = function (errObj) {
        $.writeln("BT returned an error:\n");
        $.writeln(errObj.body);
    };

    if (callBack) {
        bt.onResult = callBack;
    } else {
        bt.onResult = function (resObj) {
            // The result of executing the code is the last line of the script that was executed in the target
            $.writeln("BridgeTalk result:" + resObj.body);
            retval = eval(resObj.body);
        };
    }

    // Send the message, wait max 30 sec for response
    var wait = waitSec || 0;
    bt.send(wait);

    return retval;
};

exports.is_number = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

exports.validateString = function (str) {
    var rE, ret1;
    rE = /[^a-zA-Z0-9-äöüÄÖÜ]/g;
    ret1 = str
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/Ä/g, "Ae")
        .replace(/Ö/g, "Oe")
        .replace(/Ü/g, "Ue")
        .replace(/ß/g, "ss")
        .replace("_", "-")
        .replace(rE, "");
    return ret1;
};

exports.copyProps = function (src, dest) {
    var p;
    for (p in src) {
        if (src.hasOwnProperty(p) && src[p]) {
            dest[p] = src[p];
        }
    }
};

exports.copyToClipboard = function (myString) {
    var myCmd = makeCommand(myString);

    //export cmd command string to a BAT
    var myBAT = saveBAT(myCmd);

    if (myBAT && myBAT.exists) {
        myBAT.execute();
    }
};

exports.typeOf = function (v) {
    var ret = typeof v;
    if (ret != "object") {
        return ret;
    } else if (v == null) {
        return "null";
    } else {
        return Object.prototype.toString.call(v).slice(8, -1);
    }
};

exports.get_kuerzel = function () {
    var username = $.getenv("USERNAME");

    if (username.indexOf(".") > 0) {
        // if username contains . make kuerzel from username jan.untiedt -> JU
        return (
            username.split(".")[0][0] + username.split(".")[1][0]
        ).toUpperCase();
    } else {
        return username;
    }
};

exports.saveFile = function (dest, saveOps, close, showDialog) {
    var saveDoc = app.activeDocument;

    if (dest instanceof File) {
        var saveFile = dest;
    } else {
        var saveFile = new File(dest);
    }

    if (!saveFile.parent.exists) {
        var saveFolder = new Folder(saveFile.parent);
        saveFolder.create();
    }

    if (showDialog) saveFile = saveFile.saveDlg("Please check Filename");

    try {
        switch (app.name) {
            case "Adobe Illustrator":
                saveDoc.saveAs(saveFile, saveOps);
                break;
            case "Adobe InDesign":
                saveDoc.save(saveFile);
                break;
            case "Adobe Photoshop":
                saveDoc.saveAs(saveFile, saveOps);
                break;
        }

        if (close) {
            saveDoc.close();
        }
        return true;
    } catch (e) {
        alert(e);
        return false;
    }
};

exports.startDistiller = function () {
    var dist10 = File(
            "/c/Program Files (x86)/Adobe/Acrobat 10.0/Acrobat/acrodist.exe"
        ),
        dist11 = File(
            "/c/Program Files (x86)/Adobe/Acrobat 11.0/Acrobat/acrodist.exe"
        );

    var secsWaited = 0,
        distApp;

    if (dist10.exists) {
        distApp = dist10;
    } else if (dist11.exists) {
        distApp = dist11;
    }

    if (distApp && distApp.execute()) {
        $.sleep(1000);
        switch (app.name) {
            case "Adobe Illustrator":
                BridgeTalk.bringToFront("illustrator");
                break;

            case "Adobe InDesign":
                app.activate();
                break;

            case "Adobe Photoshop":
                app.bringToFront();
                break;
        }
        return true;
    } else {
        alert("Distiller was not found / couldn't start");
        return false;
    }
};

//wf = workingfolder, newName = name of the duplicated folder
exports.duplicateFolder = function (wf, destination, newName, refFile) {
    var dupedFolder = new Folder(destination.absoluteURI + "/" + newName);
    var FilesFolders = wf.getFiles("*.*");
    var files2move = [];
    var folders2move = [];
    var filesCool = true;

    // create containing folder if it doesn't yet exist
    if (!dupedFolder.parent.exists) {
        var tempFolder = new Folder(dupedFolder.parent);
        tempFolder.create();
    }
    dupedFolder.create();

    //select files and folder that should be moved
    //if wf does not contain the current client art file
    //mark all contained files and folders for moving
    if (wf.fullName !== refFile.path) {
        for (var i = 0, maxI = FilesFolders.length; i < maxI; i += 1) {
            var FileFolder = FilesFolders[i];
            if (FileFolder instanceof File) {
                files2move.push(FileFolder);
            } else if (FileFolder instanceof Folder) {
                folders2move.push(FileFolder);
            }
        }

        //if wf DOES contain the current client art file -> normally Kundendaten
        //only select this specific art file and all folders for moving
        //prevents all other client files from being moved to the new design folder
    } else if (wf.fullName === refFile.path) {
        for (var i = 0, maxI = FilesFolders.length; i < maxI; i += 1) {
            var FileFolder = FilesFolders[i];
            if (
                FileFolder instanceof File &&
                FileFolder.fullName === refFile.fullName
            ) {
                files2move.push(FileFolder);
            } else if (FileFolder instanceof Folder) {
                folders2move.push(FileFolder);
            }
        }
    }

    //move all selected files to duplicated folder
    for (var i = 0, maxI = files2move.length; i < maxI; i += 1) {
        var myFile = files2move[i];
        var dupedFile = new File(dupedFolder.absoluteURI + "/" + myFile.name);
        // remove the source file, if copied successfully
        if (myFile.copy(dupedFile)) {
            myFile.remove();
        } else {
            // set flag if sth went wrong, so the parent folder does not get deleted later
            filesCool = false;
            $.writeln("could not copy File: " + myFile.name);
        }
    }

    // recursive duplicate the selected folders
    for (var i = 0, maxI = folders2move.length; i < maxI; i += 1) {
        var myFolder = folders2move[i];
        f_all.duplicateFolder(myFolder, dupedFolder, myFolder.name, refFile);
    }

    //if all contained files copied fine and nothing left in the directory, delete it
    //otherwise leave as is
    if (filesCool && wf.getFiles("*.*").length === 0) {
        $.writeln(wf.name + " was " + (wf.remove() ? "" : "NOT ") + "removed!");
    } else if (wf.getFiles("*.*").length > 0) {
        $.writeln(wf.name + " still contains files, folder not removed");
    } else if (!filesCool) {
        $.writeln(
            "Sth went wrong moving the files, " + wf.name + " was not removed"
        );
    }
};

exports.copy_file_via_bridgeTalk = function (
    sourceFile,
    destFolder,
    deleteSource
) {
    function done(err, data) {
        if (err) {
            alert(data);
            $.writeln(data);
        } else {
            alert(data);
            $.writeln(data);
        }
    }

    function copyFile(mySerializedArgs) {
        var args = eval(mySerializedArgs),
            destString,
            destFile,
            secsWaited = 0;

        waitLoop: while (!args.src.exists) {
            $.sleep(3000);
            secsWaited += 3;
            if (!args.src.exists && secsWaited > 20) {
                if (
                    Window.confirm(
                        "Out-PDF konnte nicht gefunden werden, bitte Filmrechner / Distiller prüfen! Kopieren jetzt nochmal probieren?"
                    )
                ) {
                    secsWaited = 0;
                    continue waitLoop;
                } else {
                    return (
                        args.src.displayName +
                        "  konnte nicht gefunden werden. Ist der Filmrechner wirklich an? 8/"
                    );
                }
            }
        }

        destString =
            decodeURI(args.dest.fullName) + "/" + decodeURI(args.src.name);
        destFile = new File(destString);
        if (!args.dest.exists) {
            args.dest.create();
        }

        var tries = 0;
        while (!args.src.copy(destFile)) {
            if (tries > 5) {
                return (
                    "Datei : " +
                    destFile.displayName +
                    " ist da, konnte aber nicht kopiert werden. Ist die Datei am Zielort evtl. noch geöffnet?"
                );
            }
            tries += 1;
            $.sleep(3000);
        }

        if (args.delsource) {
            args.src.remove();
            args.src = null;
            return (
                "Datei : " +
                destFile.displayName +
                " wurde erfolgreich verschoben . --> 0"
            );
        } else {
            return (
                "Datei : " +
                destFile.displayName +
                " wurde erfolgreich kopiert 0 --> 0"
            );
        }
    }

    var myArgs = { delsource: deleteSource || false };
    var tempFile;
    var tempFolder;

    if (sourceFile instanceof File) {
        myArgs.src = sourceFile;
    } else {
        myArgs.src = new File(sourceFile);
    }

    if (destFolder instanceof Folder) {
        tempFolder = destFolder;
    } else {
        tempFolder = new Folder(destFolder);
    }

    if (tempFolder.exists) {
        myArgs.dest = tempFolder;
    } else {
        alert("Destinationfolder not found");
        return;
    }

    //for debugging, execute function directly without bridgetalk
    // alert(copyFile(myArgs.toSource()));

    if (myArgs.src && myArgs.dest) {
        var bt = new BridgeTalk();
        bt.target = "indesign";
        bt.body = copyFile.toSource() + "(" + myArgs.toSource() + ");";
        bt.onResult = function (inBT) {
            done(null, inBT.body);
        };
        bt.onError = function (inBT) {
            done(1, inBT.body);
        };
        bt.send(0);
    }

    return;
};

exports.escapeRegExp = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};
