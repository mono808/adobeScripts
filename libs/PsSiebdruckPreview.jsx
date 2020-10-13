var PsSiebdruck = require('PsSiebdruck');
var buttonList = require('buttonList');

function PsSiebdruckPreview (initDoc) {
    PsSiebdruck.call(this, initDoc);
}

PsSiebdruckPreview.prototype = Object.create(PsSiebdruck.prototype);
PsSiebdruckPreview.prototype.constructor = PsSiebdruckPreview;

PsSiebdruckPreview.prototype.create_layers_from_channels = function (chans) {
    try {
        var bgLayer = this.doc.artLayers.getByName('Hintergrund');
    } catch(e) {
        var bgLayer = this.doc.artLayers[0];
    };

    bgLayer.isBackgroundLayer = false;
    this.doc.selection.selectAll();
    this.doc.selection.clear();

    for (var i = 0; i < chans.length; i++) {
        var chan = chans[i];
        this.doc.activeChannels = [chan];
        this.doc.selection.load(chan);

        var spotLayer = this.doc.artLayers.add();
        this.doc.activeLayer = spotLayer;
        this.doc.selection.fill(chan.color);
        spotLayer.name = chan.name;
        spotLayer.opacity = 100;
        chan.remove();
    };

    this.doc.selection.deselect();
    this.doc.activeChannels = this.doc.componentChannels;
};

// creates a combined selection from all spotchannels
// then merge all spotchannels including t-shirt channel into rgb
// and use the created selection to make a layermask for the merged rgb image
PsSiebdruckPreview.prototype.create_merged_doc = function () {

    var activeChannels = this.get_active_channels();
    this.doc.selection.deselect;

    //this.delete_hidden_channels();

    var spotChans = this.get_spot_channels();
    if(spotChans.length < 1) {
        this.doc.close();
        alert("No spotchannels found, can't create Preview Doc");
        return;
    }

    var teeChan = this.find_tee_channel();
    /*convert tee chan to alpha, so its not misinterpreted as regular spotchannel*/
    /*
    if(teeChan && teeChan.kind == ChannelType.SPOTCOLOR) {
        teeChan.kind = ChannelType.SELECTEDAREA;
    }
    */

    var spotChans = this.get_spot_channels();

    /*create a combined selection from all spotChannels*/
    var selection = this.doc.selection;
    for (var i = 0; i < spotChans.length; i++) {
        var chan = spotChans[i];
        /*extending a selection works only with an existing selection*/
        try {
            var test = selection.bounds;
            selection.load(chan,SelectionType.EXTEND, false);

        /*if there is no selection, REPLACE the empty selection with selection from channel*/
        } catch(e) {
            selection.load(chan,SelectionType.REPLACE, false);
        }
    }

    if(!teeChan) {
        var teeChan = this.create_tee_channel();
        activeChannels = this.get_active_channels();
    }

    /*convert teeChan to spotcolor, so its included the final merge to rgb*/
    teeChan.kind = ChannelType.SPOTCOLOR;
    spotChans.unshift(teeChan);

    this.remove_alpha_channels();

    /*save the selection in an alpha channel*/
    var maskChan = this.doc.channels.add();
    maskChan.kind = ChannelType.MASKEDAREA;
    maskChan.name = 'myMask';

    selection.store(maskChan,SelectionType.REPLACE);
    selection.deselect();

	/*add rgb channels if none are present*/
    if (this.doc.mode != DocumentMode.RGB) {
        if (this.doc.componentChannels.length >= 1) {
            this.doc.changeMode(ChangeMode.RGB);
        } else {
            this.add_RGB_channels();
        }
    }

	/*merge all spotchans into the rgb chans*/
    for (var i = 0; i < spotChans.length; i++) {
        var spotChan = spotChans[i];
        if(activeChannels.includes(spotChan.name))
            spotChan.merge();
    }

    /*use the stored selection to create a mask for the artlayer*/
    var myLayer = this.doc.artLayers[0];
    this.doc.activeLayer = myLayer;
    myLayer.isBackgroundLayer = false;

    selection.load(maskChan, SelectionType.REPLACE, false);
    this.make_layer_mask('RvlS');

    /*remove the redundant stored selection, since it its now stored as layermask anyway*/
    maskChan.remove();
    selection.deselect();

    return this.doc;
};

PsSiebdruckPreview.prototype.create_layered_doc = function () {

    if (this.doc.componentChannels.length > 0) {
        this.doc.changeMode(ChangeMode.RGB);
    } else {
        this.add_RGB_channels();
    }

	this.doc.flatten();

    var teeChan = this.find_tee_channel();
    if(teeChan) teeChan.remove();

    this.remove_alpha_channels();

    var spotChans = this.get_spot_channels();
    this.create_layers_from_channels(spotChans);

    this.doc.artLayers.getByName('Ebene 0').remove();

	return this.doc;
};

PsSiebdruckPreview.prototype.get_preview_format = function () {
    var styles = ['Kanäle in Ebenen', 'Kanäle verrechnet'];

    var dialogTitle = 'Dateiformat Vorschau';
    var infoText = 'in Ebenen -> Kanale werden in Ebenen kopiert, geeignet für Vollton-Motive\r\r';
    infoText += 'verrechnet -> Kanäle werden zu RGB verrechnet, simuliert Überdrucken, geeignet für Rastermotive';
    var previewStyle = buttonList.show_dialog(styles,undefined, dialogTitle, infoText);
}

PsSiebdruckPreview.prototype.make = function (saveFile, saveOptions) {

    this.sourceDoc = this.doc;
    this.doc = this.sourceDoc.duplicate();

    var previewStyle = this.get_preview_format ();

	switch(previewStyle) {
		case 'Kanäle in Ebenen' : this.create_merged_doc ();
		break;
		case 'Kanäle verrechnet': this.create_layered_doc();
		break;
		default : this.create_layered_doc();
	}

	/*if no saveFile is provided, use same name and folder as sourceDoc with new extension*/
    if(!saveFile) {
        var search = '/_(Working|Print|Druck|Sep|Preview)/i';
        var replace = '_Preview';
        var saveFile = this.get_saveFile(this.sourceDoc.doc.fullName, search, replace, 'psd');
        this.save_doc(saveFile, saveOptions, false, true);
	} else if (saveFile instanceof File) {
        this.save_doc(saveFile, saveOptions, false, false);
    }
}

exports = module.exports = PsSiebdruckPreview;