//@include 'require.jsx'

(function () {
    var recentFiles = require('recentFiles');

    if(app.documents.length < 1) return;
    if(!app.activeDocument) return;
    var doc = app.activeDocument;
    try {
        var aFullName = doc.fullName;
    } catch(e) {
        $.writeln(doc.name + ' wurde noch nicht gespeichert');
        return;
    }   
    
    recentFiles.add_file(aFullName);
    
})();

