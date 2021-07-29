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

inddFiles.forEach(function (inddFile) {
    var inddFileStrings = inddFile.fsName.split("\\");
    var multiLinePath = inddFileStrings.join("\n");
    if (!Window.confirm("Do you want to update the links in:" + multiLinePath)) return;
    var myDoc = app.open(inddFile);
    var myLinks = make_array(myDoc.links);

    myLinks.forEach(function (link) {
        var localFile = jobFiles.find(function (elem) {
            return elem.displayName == link.name;
        });
        if (localFile) {
            var fileStrings = localFile.fsName.split("\\");
            var msg = "Do you want to relink '" + link.name + "' to:";
            msg += "\n\n";
            msg += fileStrings.join("\n");
            if (Window.confirm(msg)) link.relink(localFile);
        }
    });
    myDoc.save();
    myDoc.close();
});
