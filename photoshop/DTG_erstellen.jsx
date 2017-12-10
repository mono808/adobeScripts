#target photoshop-60.064

function get_spot_channels(myDoc) 
{
    var spotChans = [];
    var i = myDoc.channels.length-1;
    
    do {
        var chan = myDoc.channels[i];
        if (chan.kind == ChannelType.SPOTCOLOR) {
            spotChans.push(chan);
        };
    } while (i--)
    
    if(spotChans.length > 0) {
        return spotChans.reverse();
    } else {
        return false;
    }
}

function main() {
       
    var 
    originalRulerUnits = app.preferences.rulerUnits,
    backupPSD = new PhotoshopSaveOptions (),
    dtgTIFF = new TiffSaveOptions();

    with(backupPSD) {
        alphaChannels = true;
        spotColors = true;
        layers = true;
        embedColorProfile = true;
    }
    
    with (dtgTIFF) {
        alphaChannels = false;
        byteOrder = ByteOrder.IBM;
        embedColorProfile = true;
        imageCompression = TIFFEncoding.TIFFLZW;
        interleaveChannels = true;
        layers = false;
        spotColors = true;
        transparency = true;
    }

    app.preferences.rulerUnits = Units.MM;
    
    var 
    workingDoc = app.activeDocument,
    workingFile = get_working_file(workingDoc, backupPSD),
    spotChans = get_spot_channels(workingDoc);
    if(spotChans) {
        var 
        confirmStr = 'Dokument enthält Vollton-Kanäle.\n';
        confirmStr += 'Im Druck werden diese mit weißer Farbe gedruckt!\n';
        confirmStr += 'Vollton-Kanäle verwenden? (Ich weiß was ich tue ;)';
        
        if(!Window.confirm(confirmStr)) {
            dtgTIFF.spotColors = false;
        }
    }
    
    Folder.current = workingFile.parent;

    var saveFolder = new Folder(workingDoc.fullName.parent.parent + '/Druckdaten-DTG');
    var printName = change_filename(workingDoc, '-DTG', 'tif');
    var tempFile = new File(saveFolder + '/' + printName);
    if(!tempFile.parent.exists) {
        tempFile.parent.create();
    }
    //workingDoc.saveAs(tempFile,dtgTIFF,false);
    var printFile = tempFile.saveDlg('Druckdatei speichern', '*.tif');
    
    if(!printFile) return;

    if(!printFile.parent.exists) {
        printFile.parent.create();
    }
       
    workingDoc.saveAs(printFile,dtgTIFF,true);
    
    app.preferences.rulerUnits = originalRulerUnits;
}

function change_filename(sourceDoc, addString, ext)
{
    var oldName, newName = '';
    oldName = sourceDoc.name;
    newName += oldName.substring(0,oldName.lastIndexOf('.'));
    newName += addString;
    newName += '.'
    newName += ext;

    return newName;
}

function get_working_file (myDoc, saveOps) 
{
    try {
        var check = myDoc.fullName;    
    } catch(e) {       
        var saveFolder = new Folder($.getenv("csroot")+"\\kundendaten").selectDlg('Dokument wurde noch nicht gespeichert, bitte Auftragsordner wählen');
        var docName = myDoc.name;        
        var saveFile = new File(saveFolder + '/Working/' + docName);
        if(!saveFile.parent.exists) {
            saveFile.parent.create();
        }        
        saveFile = saveFile.saveDlg ('Working-Datei abspeichern');
        myDoc.saveAs(saveFile,saveOps);
    }
    return myDoc.fullName;
}

function check() 
{
    var myDoc = app.activeDocument,
    savedState = myDoc.activeHistoryState,
    modeChanged = false,
    //alertStr = '',
    shortie;
    if(myDoc.bitsPerChannel != BitsPerChannelType.EIGHT) {
        shortie = {
            'BitsPerChannelType.ONE' : '1-bit',
            'BitsPerChannelType.EIGHT' : '8-bit',
            'BitsPerChannelType.SIXTEEN' : '16-bit',
            'BitsPerChannelType.THIRTYTWO' : '32-bit',
        }
        modeChanged = true;
        alert('Bittiefe ist ' + shortie[myDoc.bitsPerChannel.toString()] + '. Motiv wird zu 8-bit umgewandelt');
        myDoc.bitsPerChannel = BitsPerChannelType.EIGHT;
    }
    if(myDoc.mode != DocumentMode.CMYK && myDoc.mode != DocumentMode.RGB) {
        shortie = {
            'DocumentMode.GRAYSCALE' : 'Graustufen',
            'DocumentMode.RGB' : 'RGB',
            'DocumentMode.CMYK' : 'CMYK',
            'DocumentMode.LAB' : 'LAB',
            'DocumentMode.BITMAP' : 'Bitmap',
            'DocumentMode.INDEXEDCOLOR' : 'IndizierteFarben',
            'DocumentMode.MULTICHANNEL' : 'Mehrkanal',
            'DocumentMode.DUOTONE' : 'Duotone',
        }
        modeChanged = true;
        alert('Farbmodus ist '+ shortie[myDoc.mode.toString()] + '. Motiv wird in RGB umgewandelt');
        myDoc.changeMode(ChangeMode.RGB);
    }

    if(modeChanged) {
        if(Window.confirm('Grafik noch ok?')) {
            return true;
        } else {
            myDoc.activeHistoryState = savedState;
            return false;
        }
    
    } else {
        return true;
    }
}

if(check()) {
    main();
}

