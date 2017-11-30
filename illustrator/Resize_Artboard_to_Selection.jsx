#target illustrator

#includepath '../includes'
#include 'illustrator_functions.jsx'

if (app.documents.length > 0 && app.activeDocument.selection.length > 0) {
    
    var myDoc = app.activeDocument;
    fit_artboard_to_selection(myDoc, myDoc.selection);

} else {
    alert('Bitte Pfade auswählen')
};