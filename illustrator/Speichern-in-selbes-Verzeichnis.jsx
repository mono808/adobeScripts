//@target illustrator
//@include 'require.jsx'

(function () {

    if(app.documents.length < 1) {
        alert('No document open, please open a document first');
        return;
    }
    
    var doc = app.activeDocument;
    if(doc.placedItems.length == 0) {
        alert('no linked graphic to get a filepath from. please place & select a graphic first!');
        return;
    }

    var sel = doc.selection;
    var ref = null;

    if(sel.length < 1) {
        alert('Please select a linked graphic to get the filepath from');
        return;
    }

    for (var i=0, len=sel.length; i < len ; i++) {
        if(sel[i].constructor.name == 'PlacedItem') {
            ref = sel[i];
            break;
        }
    }
    

    if(ref == undefined) {
        alert('no linked graphic in selection. Please select a linked graphic!');
        return;
    }

    var saveFile = ref.file.parent.saveDlg();

    if(saveFile == null) {
        alert('Script cancelled');
        return;
    }
    
    doc.saveAs(saveFile);

})();


