#target illustrator

if (app.documents.length > 0 && app.activeDocument.pageItems.length > 0) {

    function fitToArt () {

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

        var iDoc = app.activeDocument;
        iDoc.selection = selectAll();
        iDoc.fitArtboardToSelectedArt(0);        
    };

    fitToArt();

} else {alert('No active Document or is empty')};