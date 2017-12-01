#target illustrator

function fit_artboard_to_selection (myDoc, arrayOfPageItems, padding) 
{
    var i = arrayOfPageItems.length-1,
        vB,
        selBounds = arrayOfPageItems[i].visibleBounds; //use first pageItem to init the Bounds
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

if (app.documents.length > 0 && app.activeDocument.selection.length > 0) {
    
    var myDoc = app.activeDocument;
    fit_artboard_to_selection(myDoc, myDoc.selection);

} else {
    alert('Bitte Pfade auswählen')
};