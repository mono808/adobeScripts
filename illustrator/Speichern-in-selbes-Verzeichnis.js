//@target illustrator
//@include "require.js"


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

    var ref = get_first_item_from_selection(sel, "PlacedItem");

    if (!ref) {
        alert(
            "no linked graphic in selection. Please select a linked graphic!"
        );
        return;
    }

    var saveFile = ref.file.parent.saveDlg();

    if (saveFile == null) {
        alert("Script cancelled");
        return;
    }

    doc.saveAs(saveFile);
})();
