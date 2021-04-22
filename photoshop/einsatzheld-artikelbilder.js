//@include "require.js"

var buttonList = require("buttonList");

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

function add_to_collection(collection, array) {
    array.forEach(function (elem) {
        if (collection[elem.name] === undefined) {
            collection[elem.name] = [];
        }
        collection[elem.name].push(elem);
    });
    return collection;
}

function export_jpg(docRef, fileName) {
    //docRef.bitsPerChannel = BitsPerChannelType.EIGHT;
    var destination = docRef.path.fullName;
    var saveFile = new File(destination + "/" + fileName + ".jpg");
    var jpgSaveOptions = new JPEGSaveOptions();
    jpgSaveOptions.embedColorProfile = false;
    jpgSaveOptions.quality = 8;
    docRef.saveAs(saveFile, jpgSaveOptions, true);
}

function show(collection) {
    modify_collection(collection, function (elem) {
        elem.visible = true;
    });
    return collection;
}

function hide(collection) {
    modify_collection(collection, function (elem) {
        elem.visible = false;
    });
    return collection;
}

function filter_visible(collection) {
    return collection.filter(function (elem) {
        return elem.visible;
    });
}

function main(export_all) {
    var doc = app.activeDocument;

    var shirts = make_array(doc.layerSets.getByName("shirts").layers);
    var designCollection = {};
    var frontDesigns = make_array(doc.layerSets.getByName("frontDesigns").layers);
    var backDesigns = make_array(doc.layerSets.getByName("backDesigns").layers);

    if (!export_all) {
        frontDesigns = filter_visible(frontDesigns);
        backDesigns = filter_visible(backDesigns);
        shirts = filter_visible(shirts);
    } else {
        hide(shirts);
        hide(frontDesigns);
        hide(backDesigns);
    }

    add_to_collection(designCollection, frontDesigns);
    add_to_collection(designCollection, backDesigns);

    var counter = 0;
    var designNames = Object.keys(designCollection);
    designNames.forEach(function (designName) {
        var designArray = designCollection[designName];
        show(designArray);

        shirts.forEach(function (shirt) {
            var jpgName = shirt.name + "_" + designName;
            show([shirt]);
            //app.refresh();
            export_jpg(doc, jpgName);
            counter += 1;
            if (export_all) hide([shirt]);
        });

        if (export_all) hide(designArray);
    });

    alert("exported " + counter + " files");
}
function get_settings() {
    var styles = ["alle Ebenen", "nur aktive Ebenen"];
    var dialogTitle = "alle Ebenen exportieren?";
    var infoText = "Welche Ebenen sollen exportiert werden?\r\r";
    infoText += "alle Ebenen -> alle Ebenen werden nacheinander aktiviert und exportiert\r\r";
    infoText += "nur aktive Ebenen -> nur die gerade aktiven Ebenen werden exportiert";
    var exportStyle = buttonList.show_dialog(styles, undefined, dialogTitle, infoText);
    if (exportStyle == "alle Ebenen") return true;
    else return false;
}
main(get_settings());
