(function () {
    
    var disable_standAutomatik = function () {

        var standListener = null;

        for (var i = 0; i < app.eventListeners.length; i++) {
            var listener = app.eventListeners[i];
            if (listener.eventType == "afterSelectionAttributeChanged") {
                listener.remove();
                Window.alert("Stand-Automatic AUS");
            }
        }
        
        
        var doc = app.activeDocument || null;
        if(!doc) return;
        
        for (i = 0; i < doc.eventListeners.length; i++) {
            listener = doc.eventListeners[i];
            if (listener.eventType == "afterSelectionAttributeChanged") {
                listener.remove();
                Window.alert("Stand-Automatic AUS");
            }
        }
    };

    disable_standAutomatik ();

    if(app.selection.length !== 2) return;
    var docFile = app.activeDocument.fullName;
    var page = app.activeWindow.activePage;
    var tempGroup = page.groups.add(app.selection);
    tempGroup.exportFile(ExportFormat.JPG, docFile.saveDlg ('Dateinamen wählen', '*.jpg'), true);
    tempGroup.ungroup();
    
})();