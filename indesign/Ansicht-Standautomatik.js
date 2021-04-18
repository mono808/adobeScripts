//@target indesign
//@targetengine session
//@include "require.js"

var MonoGraphic = require("MonoGraphic");
var MonoTable = require("MonoTable");

var doc = app.activeDocument;
var infoLayer = doc.layers.item("Infos");
var printsLayer = doc.layers.item("Prints");

function update_stand (myEvent) {
    if (app.selection.length < 1) return;

    var e = myEvent;
    var item;
    for (var i = 0; i < app.selection.length; i++) {
        item = app.selection[i];
        if(!(item instanceof Rectangle || item instanceof Polygon)) return;
        if(item.itemLayer != printsLayer) return;
        if(item.allGraphics.length < 1) return;
        
        var myPage = item.parentPage;
        var textFrame = myPage.textFrames.item("printTableFrame");
        if(!textFrame.isValid) return;
        
        var myTable = textFrame.tables.item(0);
        if(!myTable.isValid) return;

        var monoGraphic = new MonoGraphic(item.allGraphics[0]);
        if(!monoGraphic) return;
        
        var monoTable = new MonoTable(myPage);
        if(!monoTable) return;
        
        monoTable.update_stand(monoGraphic, false);
    }
}

function toggle_standListener() {

    var standListener = null;

    for (var i = 0; i < app.eventListeners.length; i++) {
        var listener = app.eventListeners[i];
        if (listener.eventType == "afterSelectionAttributeChanged") {
            standListener = listener;
        }
    }
    for (i = 0; i < doc.eventListeners.length; i++) {
        listener = doc.eventListeners[i];
        if (listener.eventType == "afterSelectionAttributeChanged") {
            standListener = listener;
        }
    }

    if (standListener) {
        standListener.remove();
        Window.alert("Stand-Automatic AUS");
    } else {
        doc.addEventListener("afterSelectionAttributeChanged", update_stand);
        Window.alert("Stand-Automatic AN");
    }
}

if (app.documents.length > 0 && app.activeDocument) {
    toggle_standListener();
}
