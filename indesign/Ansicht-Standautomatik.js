//@target indesign
//@targetengine session
//@include "require.js"

function show_dialog() {
    var myDialog = app.dialogs.add({ name: "Stand kompensieren?" });

    var myResult = myDialog.show();
    myDialog.destroy();

    return myResult;
}

function toggle_standListener(compensate) {
    var MonoGraphic = require("MonoGraphic");
    var MonoTable = require("MonoTable");

    var compensate = false;

    var update_stand = function (myEvent) {
        if (app.selection.length < 1) return;

        var sel = app.selection;
        var myPage = app.activeWindow.activePage;
        var textFrame = infoLayer.name
            ? myPage.textFrames.item("printTableFrame")
            : null;
        var myTable = textFrame.tables.item(0);

        if (myTable && myTable.name) {
            for (var i = 0; i < sel.length; i++) {
                if (
                    (sel[i] instanceof Rectangle ||
                        sel[i] instanceof Polygon) &&
                    sel[i].itemLayer == printsLayer
                ) {
                    var monoGraphic = new MonoGraphic(sel[i].allGraphics[0]);
                    var monoTable = new MonoTable(myPage);
                    monoTable.update_stand(monoGraphic, compensate);
                }
            }
        }
    };

    var doc = app.activeDocument;
    var infoLayer = doc.layers.item("Infos");
    var printsLayer = doc.layers.item("Prints");

    var standListener = null;

    for (var i = 0; i < app.eventListeners.length; i++) {
        var listener = app.eventListeners[i];
        if (listener.eventType == "afterSelectionAttributeChanged") {
            var standListener = listener;
        }
    }
    for (var i = 0; i < doc.eventListeners.length; i++) {
        var listener = doc.eventListeners[i];
        if (listener.eventType == "afterSelectionAttributeChanged") {
            var standListener = listener;
        }
    }

    if (standListener) {
        standListener.remove();
        Window.alert("Stand-Automatic AUS");
    } else {
        //compensate = show_dialog();
        compensate = false;
        doc.addEventListener("afterSelectionAttributeChanged", update_stand);
        compensate
            ? Window.alert("Stand-Automatic KOMPENSIERT")
            : Window.alert("Stand-Automatic 1:1");
    }
}

if (app.documents.length > 0 && app.activeDocument) {
    toggle_standListener();
}
