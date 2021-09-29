//@target indesign
//@include "require.js"

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

function copy_link(link) {
    var fileName = link.name;
    //var file = link.filePath;
    var docFolder = app.activeDocument.filePath;
    var destinationFile = File(docFolder + "/" + fileName);
    if (destinationFile.exists) {
        if (Window.confirm("Relink to graphic in same folder?")) {
            link.relink(destinationFile);
            return;
        }
    }

    var destinationFolder = File(docFolder).selectDlg();
    destinationFile = File(destinationFolder + "/" + fileName);
    if (!destinationFile.exists) {
        link.copyLink(destinationFile);
    }

    if (Window.confirm("Relink graphic to new location?")) link.relink(destinationFile);
}

var selection = make_array(app.selection);

var graphics = selection.map(function (item) {
    if (item instanceof Graphic) return item;
    if (item instanceof Rectangle) {
        return item.graphics.firstItem();
    }
});

var links = graphics.map(function (graphic) {
    return graphic.itemLink;
});

modify_collection(links, copy_link);
