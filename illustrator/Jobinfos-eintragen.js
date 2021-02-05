//@target illustrator
//@include "require.js"
$.level = 2;

function hasPlacedGraphic(doc) {
    return doc.placedItems.length > 0;
}

function get_first_item_from_selection(sel, itemType) {
    for (var i = 0, len = sel.length; i < len; i++) {
        if (sel[i].constructor.name == itemType) {
            return sel[i];
        }
    }
    return false;
}

function get_artboard_rectangle(doc) {
    var activeIndex = doc.artboards.getActiveArtboardIndex();
    var ab = doc.artboards[activeIndex];
    return ab.artboardRect;
}

(function () {
    if (app.documents.length < 1) {
        alert("No document open, please open a document first");
        return;
    }

    var doc = app.activeDocument;
    var sel = doc.selection;

    if (!hasPlacedGraphic(doc)) {
        alert(
            "no linked graphic to get a filepath from. please place & select a graphic first!"
        );
        return;
    }

    var ref;
    if (doc.placedItems.length == 1) {
        ref = doc.placedItems[0];
    } else {
        ref = get_first_item_from_selection(sel, "PlacedItem");
    }

    if (!ref) {
        alert(
            "no linked graphic in selection. Please select a linked graphic!"
        );
        return;
    }

    var job = require("job");
    job.set_nfo(ref.file, true, false);

    var now = new Date();
    var dateString =
        now.getFullYear() +
        "-" +
        ("0" + (now.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + now.getDate()).slice(-2) +
        " " +
        ("0" + now.getHours()).slice(-2) +
        ":" +
        ("0" + now.getMinutes()).slice(-2);

    var jobText = job.nfo.client + " - Auftrag: " + job.nfo.jobNr;
    if (job.nfo.jobName) {
        jobText += "_" + job.nfo.jobName;
    }
    jobText += " - erstellt: " + dateString;

    // rectangle.array =    0
    //                  2       1
    //                      3

    var abRect = get_artboard_rectangle(doc);

    var textFrame = doc.textFrames.add();
    textFrame.contents = jobText;
    textFrame.position = [abRect[2], abRect[0]];
    textFrame.position = [abRect[2], abRect[0]];
})();
