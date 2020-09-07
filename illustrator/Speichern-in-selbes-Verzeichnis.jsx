#target illustrator

try {

    function main(doc) {
        if(doc.placedItems.length == 0)
            throw new Error('no linked graphic to get a filepath from. please place & select a graphic first!');

        var sel = doc.selection;
        var ref = null;

        if(sel.length < 1)
            throw new Error('Please select a linked graphic to get the filepath from');

        for (var i=0, len=sel.length; i < len ; i++) {
          if(sel[i].constructor.name == 'PlacedItem') {
            ref = sel[i];
            break;
          }
        };
        

        if(ref == undefined)
            throw new Error('no linked graphic in selection. Please select a linked graphic!');

        var saveFile = ref.file.parent.saveDlg();

        if(saveFile == null)
            throw new Error('Script cancelled');
        
        doc.saveAs(saveFile);

    }

    if(app.documents.length < 1)
        throw new Error ('No document open, please open a document first');
        
    main(app.activeDocument);


} catch(e) {
    alert("Fehler:\n\n" + e.message);

    $.writeln("Error: " + e.message);
    $.writeln("Line: " + e.line);
    $.writeln("Script: " + e.fileName);
}


