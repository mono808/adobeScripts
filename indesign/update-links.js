//@target indesign
//@include "require.js"

var ioFile = require("ioFile");

function make_array(collection) {
    var myArray = [];
    for (var index = 0; index < collection.length; index++) {
        var element = collection[index];
        myArray.push(element);
    }
    return myArray;
}

function modify_collection(collection, modify) {
    collection.forEach(function (elem) {
        modify(elem);
    });

    return collection;
}

var doc = app.activeDocument;
var docFolder = app.activeDocument.filePath;

var jobFiles = ioFile.get_files(docFolder.parent);
var inddFiles = jobFiles.filter(function (file) {
    return file.displayName.indexOf(".indd") > -1;
});

function create_path_msg(aFile) {
    var arr = aFile.fsName.split("\\");
    var msg = arr.pop();
    msg += "\n\n";
    msg += arr.join("\n");

    return msg;
}

inddFiles.forEach(function (inddFile) {
    var msg = "Do you want to update the links in:\n\n";
    msg += create_path_msg(inddFile);

    if (!Window.confirm(msg)) return;
    var myDoc = app.open(inddFile);
    var myLinks = make_array(myDoc.links);

    myLinks.forEach(function (link) {
        var localFile = jobFiles.find(function (elem) {
            return elem.displayName == link.name;
        });
        if (localFile) {
            // var msg = "Do you want to relink '" + link.name + "' to:\n\n";
            // msg += create_path_msg(localFile);
            // if (Window.confirm(msg)) {
            link.relink(localFile);
            // };
        } else {
            Window.alert("cant find a local file for " + link.name);
        }
    });
    myDoc.save();
    myDoc.close();
});
