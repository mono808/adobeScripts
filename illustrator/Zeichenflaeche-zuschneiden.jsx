//@target illustrator

(function () {
    
    var AiBase = require('AiBase');


    function selectAll() {
        var doc = app.activeDocument,
            selection = [];
        for (var i = 0, maxI = doc.pageItems.length; i < maxI; i += 1) {
            var pI = doc.pageItems[i];
            if ((pI.locked == false) && (pI.name != 'sepBG')) {
                selection.push(pI);
            };
        };
        return selection;
    };



    if (app.documents.length > 0 && app.activeDocument.pageItems.length > 0) {

        if(app.activeDocument.selection.length > 0) {
            fit_artboard_to_selection(app.activeDocument, app.activeDocument.selection)
        } else {
            fit_artboard_to_selection(app.activeDocument, selectAll(app.activeDocument))
        }

    } else {alert('No active Document or is empty')};

}())

