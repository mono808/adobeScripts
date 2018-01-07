
#targetengine session 
#target indesign

function toggle_standListener () {
    
    #include 'MonoGraphic.jsx'
    #include 'MonoTable.jsx'
    
    var update_stand = function (myEvent) 
    {
        if(app.selection.length < 1) return;
        
        var sel = app.selection;
        var myPage = app.activeWindow.activePage;
        var textFrame = infoLayer.name ? myPage.textFrames.item('printTableFrame') : null;
        var myTable = textFrame.tables.item(0);
        
        if(myTable && myTable.name) {
            for (var i = 0; i < sel.length; i++) {
                if(sel[i] instanceof Rectangle && sel[i].itemLayer == printsLayer) {
                    var monoGraphic = new MonoGraphic(sel[i].allGraphics[0]);
                    var monoTable = new MonoTable(myPage);
                    monoTable.update_stand(monoGraphic);
                }
            }
        }
    };

    var doc = app.activeDocument;  
    var infoLayer = doc.layers.item('Infos');
    var printsLayer = doc.layers.item('Prints');
    
    var standListener = null;
    
    for (var i = 0; i < app.eventListeners.length; i++) {
        var listener = app.eventListeners[i];
        if(listener.eventType == "afterSelectionAttributeChanged") {
            var standListener = listener;
        }
    }
    for (var i = 0; i < doc.eventListeners.length; i++) {
        var listener = doc.eventListeners[i];
        if(listener.eventType == "afterSelectionAttributeChanged") {
            var standListener = listener;
        }
    }

    if(standListener) {
        standListener.remove();
        Window.alert('Stand-Automatic AUS');
    } else {
        doc.addEventListener("afterSelectionAttributeChanged", update_stand);
        Window.alert('Stand-Automatic AN');
    }
};

if(app.documents.length > 0 && app.activeDocument) {
    toggle_standListener();
}
