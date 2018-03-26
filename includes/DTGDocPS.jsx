#include './BaseDocPS.jsx'

#target photoshop-60.064

var dtgDocPS = Object.create(baseDocPS);

dtgDocPS.psdOptions = new PhotoshopSaveOptions ();
with(dtgDocPS.psdOptions) {
    alphaChannels = true;
    spotColors = true;
    layers = true;
    embedColorProfile = true;
}

dtgDocPS.tiffOptions = new TiffSaveOptions();
with (dtgDocPS.tiffOptions) {
    alphaChannels = false;
    byteOrder = ByteOrder.IBM;
    embedColorProfile = true;
    imageCompression = TIFFEncoding.TIFFLZW;
    interleaveChannels = true;
    layers = false;
    spotColors = true;
    transparency = true;
}

dtgDocPS.check = function () {

    this.doc = this.startDoc;

    var savedState = this.doc.activeHistoryState;
    var modeChanged = false;
    var shortie;

    if(this.doc.bitsPerChannel != BitsPerChannelType.EIGHT) {
        shortie = {
            'BitsPerChannelType.ONE' : '1-bit',
            'BitsPerChannelType.EIGHT' : '8-bit',
            'BitsPerChannelType.SIXTEEN' : '16-bit',
            'BitsPerChannelType.THIRTYTWO' : '32-bit',
        }
        modeChanged = true;
        alert('Bittiefe ist ' + shortie[this.doc.bitsPerChannel.toString()] + '. Motiv wird zu 8-bit umgewandelt');
        this.doc.bitsPerChannel = BitsPerChannelType.EIGHT;
    }

    if(this.doc.mode != DocumentMode.CMYK && this.doc.mode != DocumentMode.RGB) {
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
        alert('Farbmodus ist '+ shortie[this.doc.mode.toString()] + '. Motiv wird in RGB umgewandelt');
        this.doc.changeMode(ChangeMode.RGB);
    }

    if(modeChanged) {
        if(Window.confirm('Grafik noch ok?')) {
            return true;
        } else {
            this.doc.activeHistoryState = savedState;
            return false;
        }
    }

    var spotChans = this.get_spot_channels();
    if(spotChans.length > 0) {
        var confirmStr = 'Dokument enthält Vollton-Kanäle.\n';
        confirmStr += 'Im Druck werden diese mit weißer Farbe gedruckt!\n';
        confirmStr += 'Vollton-Kanäle verwenden? (Ich weiß was ich tue ;)';

        if(Window.confirm(confirmStr)) {
            this.tiffOptions.spotColors = true;
        } else {
            this.tiffOptions.spotColors = false;
        }
    }

    return true;
}

dtgDocPS.make = function (saveFile) {

    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.MM;

    try{
        var check = this.startDoc.fullName;
    } catch (e) {
        var saveFolder = new Folder($.getenv("csroot")+"\\kundendaten").selectDlg('Dokument wurde noch nicht gespeichert, bitte Auftragsordner wählen');
        var saveFile = new File(saveFolder + '/' + this.startDoc.name);
        this.startDoc.saveAs(saveFile);
    }

    var saveFolder = new Folder(this.startDoc.fullName.parent.parent + '/Druckdaten-DTG');

    this.doc = this.startDoc.duplicate() || app.activeDocument.duplicate();

    //baseDoc.get_saveName = function (sourceFile, search, replace, extension)
    try {
        var searchFor = ['Working', 'Print', 'Sep'];
        var saveName = this.get_saveName(this.startDoc.fullName, searchFor, 'DTG', 'tif');
    } catch (e) {
        alert(e);
    }
    var saveFile = new File(saveFolder + '/' + saveName);

    //baseDoc.save_doc = function (dest, saveOps, close, showDialog)
    this.save_doc(saveFile, this.tiffOptions, false, true);

    app.preferences.rulerUnits = originalRulerUnits;
}

