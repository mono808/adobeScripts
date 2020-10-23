var PsBase = require('PsBase');

function PsDtg (initDoc) {
    PsBase.call(this, initDoc);
};

PsDtg.prototype = Object.create(PsBase.prototype);
PsDtg.prototype.constructor = PsDtg;

PsDtg.prototype.check = function () {

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

PsDtg.prototype.make = function (saveFile, saveOpts) {

    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.MM;

    this.sourceDoc = this.doc;
    this.doc = this.sourceDoc.duplicate();

    try{
        var check = this.sourceDoc.fullName;
        var saveFolder = new Folder(this.sourceDoc.fullName.parent.parent + '/Druckdaten-DTG');
        try {
            var searchFor = ['Working'];
            var saveName = this.get_saveName(this.sourceDoc.fullName, searchFor, 'Print', 'tif');
        } catch (e) {
            alert(e);
        }
        var saveFile = new File(saveFolder + '/' + saveName);        
        
    } catch (e) {
        var recentFolders = new recentFolders();
        recentFolders.import_txt();
        var saveFolder = recentFolders.show_dialog();
        var saveFile = new File(saveFolder + '/Druckdaten-DTG/' + this.sourceDoc.name).saveDlg('Dokument wurde noch nicht gespeichert, bitte Auftragsordner wählen');
        //saveFile = saveFile.saveDlg('Dokument wurde noch nicht gespeichert, bitte Auftragsordner wählen');        
    }

    //this.doc = this.sourceDoc.duplicate() || app.activeDocument.duplicate();

    this.save_doc(saveFile, saveOpts, false, true);

    app.preferences.rulerUnits = originalRulerUnits;
}

exports = module.exports = PsDtg;