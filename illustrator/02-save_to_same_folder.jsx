#target illustrator

function main (doc) {
    if (doc.placedItems.length > 0) {
        var i;
        var pI;
        var ref;
        for(i=0; i < doc.placedItems.length; i++) {
            pI = doc.placedItems[i];
            if(pI.layer == doc.layers.getByName('Motiv')) {
                ref = doc.placedItems[0].file;
            }
        }
    }
    var saveFile = ref.parent.saveDlg();
    doc.saveAs(saveFile);
}

main(app.activeDocument);