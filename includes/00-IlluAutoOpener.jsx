function check_if_file(aFile) {
    return aFile.constructor.name === 'File';
}

function choose_from_array (myArray, propToList, dialogTitle) {
    var result = null;
    var win = new Window('dialog', dialogTitle || 'Die Qualle und der Wal:');
    win.spacing = 4;
    
    var helper = function (i) {
        return function (e) {
            result = myArray[i];                
            win.close();
        }
    };

    var i,
        maxI,
        listEntry;

    for (i = 0, maxI = myArray.length; i < maxI; i += 1) {

        listEntry = propToList ? myArray[i][propToList].toString() : myArray[i].toString();

        win[i] = win.add('button', [25, 25, 250, 45], listEntry.toString());
        win[i].onClick = helper(i);
    }
           
    win.show();
    return result;
}

var templates = Folder('/c/capri-links/druckvorstufe/scriptVorlagen/filme/').getFiles(check_if_file);
templates.sort();

var fileToOpen = choose_from_array(templates, 'displayName');
if(fileToOpen) {
    app.open(fileToOpen);
}