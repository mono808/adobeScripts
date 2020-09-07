#target illustrator

(function () {
    
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

    function fit_artboard_to_selection (myDoc, arrayOfPageItems, padding) 
    {
        var i = arrayOfPageItems.length-1;
        var vB;
        var selBounds = arrayOfPageItems[i].visibleBounds; //use first pageItem to init the Bounds
        
        do {
            vB = arrayOfPageItems[i].visibleBounds; /*bounds = [left,top,right,bottom]*/
            selBounds[0] = vB[0] < selBounds[0] ? vB[0] : selBounds[0];
            selBounds[1] = vB[1] > selBounds[1] ? vB[1] : selBounds[1];
            selBounds[2] = vB[2] > selBounds[2] ? vB[2] : selBounds[2];
            selBounds[3] = vB[3] < selBounds[3] ? vB[3] : selBounds[3];
        } while (i--);

        var myBorder = padding;
        var myBorderInput = -1;
        while (myBorder < 0 || myBorder > 100 || isNaN(myBorder) ) {
            myBorderInput = prompt("Size of padding around image, in points (0-100)","20","Padding Size");
            myBorder = parseInt(myBorderInput);
        }

        selBounds[0] -= myBorder;
        selBounds[1] += myBorder;
        selBounds[2] += myBorder;
        selBounds[3] -= myBorder;

        var ab = myDoc.artboards.getActiveArtboardIndex();  
        myDoc.artboards[ab].artboardRect = selBounds;

        return myDoc;
    }

    if (app.documents.length > 0 && app.activeDocument.pageItems.length > 0) {

        if(app.activeDocument.selection.length > 0) {
            fit_artboard_to_selection(app.activeDocument, app.activeDocument.selection)
        } else {
            fit_artboard_to_selection(app.activeDocument, selectAll(app.activeDocument))
        }

    } else {alert('No active Document or is empty')};

}())

