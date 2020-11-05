var PsBase = require('PsBase');

function PsDtg (initDoc) {
    PsBase.call(this, initDoc);
};

PsDtg.prototype = Object.create(PsBase.prototype);
PsDtg.prototype.constructor = PsDtg;


PsDtg.prototype.check = function () {

    if(!this.checkBitsPerChannel ([BitsPerChannelType.EIGHT])) return false;
    
    if(!this.checkDocumentMode ([DocumentMode.RGB, DocumentMode.CMYK])) return false;

    var spotChans = this.get_spot_channels();
    if(spotChans.length > 0) {
        var confirmStr = 'Dokument enthält Vollton-Kanäle.\n';
        confirmStr += 'Im Druck werden diese mit weißer Farbe gedruckt!\n';
        confirmStr += 'Vollton-Kanäle verwenden? (Ich weiß was ich tue ;)';

        if(Window.confirm(confirmStr)) {
            this.saveSpotChannels = true;
        } else {
            this.saveSpotChannels = false;
        }
    }

    return true;
}

PsDtg.prototype.make = function (saveFile, saveOpts) {

    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.MM;

    this.sourceDoc = this.doc;
    this.doc = this.sourceDoc.duplicate();
    
    if(!this.check()) return;

    if(this.saveSpotChannels) saveOpts.spotColors = true;

    if(!saveFile) {
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
        }
    }

    var close = true, showDialog = false;
    this.save_doc(saveFile, saveOpts, close, showDialog);

    app.preferences.rulerUnits = originalRulerUnits;
}

exports = module.exports = PsDtg;