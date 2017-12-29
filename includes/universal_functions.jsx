function is_number (n) 
{
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function validateString (str) 
{
    var rE, ret1;
    rE = /[^a-zA-Z0-9-äöüÄÖÜ]/g;            
    ret1 = str.replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/Ä/g,"Ae").replace(/Ö/g,"Oe").replace(/Ü/g,"Ue").replace(/ß/g,"ss").replace('_', '-').replace(rE, '');        
    return ret1;
}

function copyProps (src, dest) 
{
    var p;
    for(p in src) {
        if(src.hasOwnProperty(p) && src[p]) {
            dest[p] = src[p];
        }
    }
}
    
function bt_simple_callback( err, data ) 
{
    if ( err ) {
        $.writeln( data );
        alert(data);
    } else {        
        $.writeln( data );
        alert(data);
    }
}

function bt_position_sep_on_film (serializedmyArgs) 
{
    var myArgs = eval(serializedmyArgs);
    
    app.doScript(myArgs.templateScript);
    
    var iDoc = app.activeDocument;
    var myPage = iDoc.pages[0];
    var sepLayer = iDoc.layers.item('sep');
    var sepRef = myPage.place(myArgs.sep);
    var mySep = sepLayer.allGraphics[0];
    
    iDoc.activeLayer = sepLayer;
    
    if (myArgs.pos.x && myArgs.pos.y) {
        /*position sep as in pos.x and pos.y*/
        var vLine = iDoc.pages[0].guides.item('centerLine');
        var sepCoor = {};

        sepCoor.x = vLine.location + myArgs.pos.x;
        sepCoor.y = myPage.bounds[0] + myArgs.pos.y;
        mySep.parent.move( [sepCoor.x, sepCoor.y] );
        app.doScript(myArgs.filmScript);
        return 'Sep placed according to PlacementInfos';

    } else {
        /*center sep on page*/
        var iWidth = itemRef.geometricBounds[3] - itemRef.geometricBounds[1];
        var iHeight = itemRef.geometricBounds[2] - itemRef.geometricBounds[0];
        var pWidth = iDoc.documentPreferences.pageWidth;
        var pHeight = iDoc.documentPreferences.pageHeight;
        var centerCoor = {};

        centerCoor.x = pWidth/2 - iWidth /2;
        centerCoor.y = pHeight/2 - iHeight /2;
        itemRef.parent.move( [centerCoor.x, centerCoor.y] );            
        return 'Sep centered on Page';
    }
}

function send_sep_to_indesign (sepFile, pos) 
{
    var myArgs = {
        sep : sepFile,
        pos : {
            x : (pos && pos.x ? pos.x.as('mm') : null),
            y : (pos && pos.y ? pos.y.as('mm') : null),
        },
        templateScript : new File('/c/capri-links/scripts2/indesign/Film_Blanko.jsx'),
        filmScript :     new File('/c/capri-links/scripts2/indesign/Film_Reset.jsx')
    };

    var bt = new BridgeTalk;
    bt.target = 'Indesign';   
    bt.body = bt_position_sep_on_film.toSource() + "(" + myArgs.toSource() + ");";
    bt.onResult = function( inBT ) { bt_simple_callback( null, inBT.body );  };
    bt.onError = function( inBT ) { bt_simple_callback( 1, inBT.body );  };
    bt.send(0);
  
    return;
}

function bt_copy_file(mySerializedArgs)
{
    var args = eval(mySerializedArgs),
        destString,
        destFile,
        secsWaited = 0;

    waitLoop : while(!args.src.exists)
    {
        $.sleep(3000);
        secsWaited += 3;
        if(!args.src.exists && secsWaited > 20) {
            if(Window.confirm('Out-PDF konnte nicht gefunden werden, bitte Filmrechner / Distiller prüfen! Kopieren jetzt nochmal probieren?')) {
                secsWaited = 0;
                continue waitLoop;
            } else {
                return args.src.displayName + "  konnte nicht gefunden werden. Ist der Filmrechner wirklich an? 8/";
            }
        }
    }

    destString = decodeURI(args.dest.fullName) + "/" + decodeURI(args.src.name);
    destFile = new File (destString);
    if (!args.dest.exists) {args.dest.create()};

    var tries = 0;
    while(!args.src.copy(destFile)) 
    {
        if(tries > 5) {return "Datei : "+ destFile.displayName + " ist da, konnte aber nicht kopiert werden. Ist die Datei am Zielort evtl. noch geöffnet?";}
        tries+=1;
        $.sleep(3000);
    }

    if(args.delsource) 
    {
        args.src.remove();
        args.src = null;
        return "Datei : "+ destFile.displayName + " wurde erfolgreich verschoben . --> 0";
    } else {
        return "Datei : "+ destFile.displayName + " wurde erfolgreich kopiert 0 --> 0";
    }
}

function copy_file_via_bridgeTalk (sourceFile, destFolder, deleteSource) 
{
    var myArgs = { delsource : deleteSource || false },
        tempFile,
        tempFolder;

    if(sourceFile instanceof File) {
        myArgs.src = sourceFile;
    } else {
        myArgs.src = new File(sourceFile);
    }

    if(destFolder instanceof Folder) {
        tempFolder = destFolder;
    } else {
        tempFolder = new Folder(destFolder);
    }

    if(tempFolder.exists) {
        myArgs.dest = tempFolder;
    } else {
        alert('Destinationfolder not found');
        return;
    }

    //for debugging, execute function directly without bridgetalk
    // alert(bt_copy_file(myArgs.toSource()));
    
    if(myArgs.src && myArgs.dest)
    {
        var bt = new BridgeTalk;
        bt.target = 'estoolkit';            
        bt.body = bt_copy_file.toSource() + "(" + myArgs.toSource() + ");";
        bt.onResult = function( inBT ) { bt_simple_callback( null, inBT.body ); };       
        bt.onError = function( inBT ) { bt_simple_callback( 1, inBT.body ); };
        bt.send(0);
    }

    return;
}

function typeOf (v) 
{
    var ret=typeof(v);
    if (ret!="object") {
        return ret;
    } else if(v==null) {
        return "null";  
    } else {
        return Object.prototype.toString.call(v).slice(8,-1);       
    }
}

function get_kuerzel () 
{
    var username = $.getenv('USERNAME');
    
    if(username.indexOf('.') > 0) {
        // if username contains . make kuerzel from username jan.untiedt -> JU
        return (username.split('.')[0][0] + username.split('.')[1][0]).toUpperCase();        
    } else {
        return username;
    }
}

function save_file (dest, saveOps, close, dialog) 
{
    var 
    saveFile,
    saveFolder,
    saveDoc;

    if(dest instanceof File) {
        saveFile = dest;
    } else {
        saveFile =  new File(dest);
    }
    
    if (!saveFile.parent.exists) {
        saveFolder = new Folder(saveFile.parent)
        saveFolder.create();
    };

    if(dialog) {
        saveFile = saveFile.saveDlg('Please check Filename');
    }
    saveDoc = app.activeDocument;


    try {
        switch (app.name) {
            case 'Adobe Illustrator' :
                saveDoc.saveAs(saveFile, saveOps);      
            break;
            case 'Adobe InDesign' :
                saveDoc.save (saveFile);
            break;
            case 'Adobe Photoshop' :
                saveDoc.saveAs(saveFile, saveOps);
            break;
        }

        if(close) {saveDoc.close()};
        return true;

    } catch(e) {
        alert(e);
        return false;
    }
}

function save_file_with_dialog (dest, saveOps, close, dialog) 
{
    var 
    saveFile,
    saveFolder,
    saveDoc;

    if(dest) 
    { 
        if(dest instanceof File) {
            saveFile = dest;
        } else {
            saveFile =  new File(dest);
        }
    } 
    
    if (!saveFile.parent.exists) {
        saveFolder = new Folder(saveFile.parent)
        saveFolder.create();
    };


    saveFile = saveFile.saveDlg('Please check Filename');

    saveDoc = app.activeDocument;

    try {
        switch (app.name) {
            case 'Adobe Illustrator' :
                saveDoc.saveAs(saveFile, saveOps);      
            break;
            case 'Adobe InDesign' :
                saveDoc.save (saveFile);
            break;
            case 'Adobe Photoshop' :
                saveDoc.saveAs(saveFile, saveOps);
            break;
        }

        if(close) {saveDoc.close()};
        return true;

    } catch(e) {
        alert(e);
        return false;
    }
}

function openFile (source) 
{
    var sourceFile = new File (source);
    return (app.open(sourceFile));   
}

function startDistiller () 
{
    var dist10 = File('/c/Program Files (x86)/Adobe/Acrobat 10.0/Acrobat/acrodist.exe'),
        dist11 = File('/c/Program Files (x86)/Adobe/Acrobat 11.0/Acrobat/acrodist.exe');

    var secsWaited = 0,
        distApp;

    if(dist10.exists) {
        distApp = dist10;
    } else if (dist11.exists) {
        distApp = dist11;
    }

    if(distApp && distApp.execute()) {        
        $.sleep(1000);
        switch (app.name) {

            case 'Adobe Illustrator' :
                BridgeTalk.bringToFront('illustrator');       
            break;
            
            case 'Adobe InDesign' :
                app.activate();
            break;

            case 'Adobe Photoshop' :
                app.bringToFront();
            break;
        }
        return true;
    } else {
        alert("Distiller was not found / couldn't start");
        return false;
    }
}

//wf = workingfolder, newName = name of the duplicated folder
function duplicate_folder (wf, destination, newName, refFile) 
{
    var dupedFolder = new Folder(destination.absoluteURI + '/' + newName),
        tempFolder;

    var FilesFolders = wf.getFiles('*.*'),
        FileFolder,
        files2move = [],
        myFile,
        dupedFile,
        folders2move = [],            
        myFolder,
        filesCool = true,
        i,
        maxI;

    // create containing folder if it doesn't yet exist
    if (!dupedFolder.parent.exists) {
        tempFolder = new Folder(dupedFolder.parent);
        tempFolder.create();
    };
    dupedFolder.create();

    //select files and folder that should be moved
    //if wf does not contain the current client art file
    //mark all contained files and folders for moving
    if (wf.fullName !== refFile.path) {
        for (i = 0, maxI = FilesFolders.length; i < maxI; i += 1) {
            FileFolder = FilesFolders[i];
            if (FileFolder instanceof File) {
                files2move.push(FileFolder);
            } else if (FileFolder instanceof Folder) {
                folders2move.push(FileFolder);
            }
        }

    //if wf DOES contain the current client art file -> normally Kundendaten      
    //only select this specific art file and all folders for moving
    //prevents all other client files from being moved to the new design folder
    } else if (wf.fullName === refFile.path) {
        for (i = 0, maxI = FilesFolders.length; i < maxI; i += 1) {
            FileFolder = FilesFolders[i];
            if (FileFolder instanceof File && FileFolder.fullName === refFile.fullName) {
                files2move.push(FileFolder);
            } else if (FileFolder instanceof Folder) {
                folders2move.push(FileFolder);
            }
        }
    }

    //move all selected files to duplicated folder
    for (i = 0, maxI = files2move.length; i < maxI; i += 1) {
        myFile = files2move[i];
        dupedFile = new File (dupedFolder.absoluteURI + '/' + myFile.name);
        // remove the source file, if copied successfully
        if (myFile.copy(dupedFile)) {
            myFile.remove();
        } else {
            // set flag if sth went wrong, so the parent folder does not get deleted later
            filesCool = false;
            $.writeln('could not copy File: ' + myFile.name);
        }
    };

    // recursive duplicate the selected folders
    for (i = 0, maxI = folders2move.length; i < maxI; i += 1) {
        myFolder = folders2move[i];
        duplicate_folder(myFolder, dupedFolder, myFolder.name, refFile);
    }

    //if all contained files copied fine and nothing left in the directory, delete it
    //otherwise leave as is
    if(filesCool && (wf.getFiles('*.*').length === 0)) {            
        $.writeln(wf.name + ' was ' + (wf.remove() ? '' : 'NOT ') + 'removed!');
    } else if (wf.getFiles('*.*').length > 0) {
        $.writeln(wf.name + ' still contains files, folder not removed');
    } else if (!filesCool) {
        $.writeln('Sth went wrong moving the files, ' + wf.name + ' was not removed');
    };
}

function choose_from_array_indd (myArray, propToList, dialogTitle) 
{
    var result = null;
    var win = new Window('dialog', dialogTitle || 'Leervorlage wählen:');
    win.spacing = 4;
    
    var helper = function (i) {
        return function (e) {
            result = myArray.item(i);
            //alert('Wow SUPER. Nee echt, ganz toll gemacht...');
            win.close();
        }
    }

    try {
        var i,
            maxI,
            listEntry;

        for (i = 0, maxI = myArray.length; i < maxI; i += 1) {

            listEntry = propToList ? myArray.item(i)[propToList].toString() : myArray.item(i).toString();

            win[i] = win.add("button", [25, 25, 250, 45], listEntry.toString());
            win[i].onClick = helper(i);
        };

    } catch (e) {
        alert(e);
    };
           
    win.show();
    return result;
}

function escapeRegExp (str) 
{
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function change_filename(sourceFile, addString, ext)
{
    var oldName, newName = '';
    oldName = sourceFile.name;
    newName += oldName.substring(0,oldName.lastIndexOf('.'));

    if(addString && addString.constructor.name == 'Array') {
        newName = newName.replace(addString[0],addString[1]);
    } else {
        newName += addString;  
    }

    if(ext.indexOf('.') < 0) {
        newName += '.';    
    }    
    newName += ext;
    
    var newFile = new File(sourceFile.parent + '/' + newName);
    
    return newFile;
}
function create_filename(sourceFile, searchStr, replaceStr, extension)
{
    var oldName, newName = '';
    oldName = sourceFile.name;
    newName += oldName.substring(0,oldName.lastIndexOf('.'));

    if(addString && addString.constructor.name == 'Array') {
        newName = newName.replace(addString[0],addString[1]);
    } else {
        newName += addString;  
    }

    if(ext.indexOf('.') < 0) {
        newName += '.';    
    }    
    newName += ext;
    
    var newFile = new File(sourceFile.parent + '/' + newName);
    
    return newFile;
}
function exec_script(myApp, script) 
{
    var apps = {
        ai : illustrator,
        ps : photoshop,
        id : indesign
    };
    
    if(script.exists) {
        
        var read_file = script;
        read_file.open('r', undefined, undefined);
        read_file.encoding = "UTF-8";      
        read_file.lineFeed = "Windows";

        if (read_file !== '') {
            var scriptStr = read_file.read();
            //scriptStr = 'alert("blabla");';
            apps[myApp].executeScript(scriptStr);
        }
    }
}
