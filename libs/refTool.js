// try to get a reference to a job from active documents or placed graphics
var rE = require("rE");
var recentFolders = require("recentFolders");

function is_valid_ref(aString) {
    if (rE.jobNr.test(aString)) return true;
    if (rE.print.test(aString)) return true;
    if (rE.printTag.test(aString)) return true;
    if (rE.printTag2.test(aString)) return true;
    return false;
}

exports.get_ref_from_doc = function (doc) {
    if (!doc) {
        try {
            if (app.documents.length > 0) {
                doc = app.activeDocument;
            } else {
                return null;
            }
        } catch (e) {
            $.writeln("No open document to get ref from!");
            $.writeln($.fileName + ":" + $.line);
            $.writeln($.stack);
            return null;
        }
    }

    switch (app.name) {
        case "Adobe Illustrator":
            return get_ref_from_ai_doc(doc);

        case "Adobe InDesign":
            return get_ref_from_indd_doc(doc);

        case "Adobe Photoshop":
            return get_ref_from_ps_doc(doc);
    }
};

exports.get_ref_from_saveDialog = function () {
    return File.saveDialog();
};

exports.add_ref = function (ref) {
    recentFolders.add(ref);
};

function get_ref_from_indd_doc(doc) {
    // if no docs are visible, dont try to get a ref
    if (app.layoutWindows.length < 1) {
        return null;
    }

    //close leftover docs without a layoutwindow
    var i, maxI, myDoc;
    for (i = 0, maxI = app.documents.length; i < maxI; i += 1) {
        myDoc = app.documents[i];
        if (myDoc.windows.length < 1) {
            myDoc.close(SaveOptions.NO);
        }
    }

    if (doc.saved && is_valid_ref(doc.fullName)) {
        return new File(doc.fullName);
    }

    if (doc.allGraphics.length > 0) {
        var motivLayer = doc.layers.item("motivEbene");
        if (motivLayer.isValid) {
            var myGraphic = motivLayer.allGraphics[0];
            if (
                myGraphic &&
                myGraphic.isValid &&
                is_valid_ref(myGraphic.properties.itemLink.filePath)
            ) {
                return new File(myGraphic.properties.itemLink.filePath);
            }
        } else {
            return doc;
        }
    }

    return null;
}

function get_ref_from_ps_doc(doc) {
    try {
        var check = doc.fullName;
        if (is_valid_ref(doc.fullName)) {
            return new File(doc.fullName);
        }
    } catch (e) {
        return null;
    }
    return null;
}

function get_ref_from_ai_doc(doc) {
    //check if ref has a jobStyle FileName
    if (is_valid_ref(doc.name)) {
        return new File(doc.fullName);

        //if not, check if placedGraphic has a jobStyle FileName (only if its on Motiv-Layer)
    } else if (doc.placedItems.length > 0) {
        var i = null,
            pI = null;
        for (i = 0; i < doc.placedItems.length; i++) {
            pI = doc.placedItems[i];
            if (pI.layer == doc.layers.getByName("Motiv")) {
                if (is_valid_ref(doc.placedItems[i].file.fullName)) {
                    return new File(doc.placedItems[i].file.fullName);
                }
            }
        }

        //if not, check if the whole filepath contains a jobnumber
    } else if (doc.fullName.exists && is_valid_ref(doc.fullName)) {
        return new File(doc.fullName);
    }

    return null;
}
