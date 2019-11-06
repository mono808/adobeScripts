#include './BaseDocPS.jsx'
#include './ButtonList.jsx'

var previewDocPS = Object.create(baseDocPS);

previewDocPS.saveOps = new PhotoshopSaveOptions ();
with(previewDocPS.saveOps) {
    alphaChannels = false;
    spotColors = false;
    layers = true;
    embedColorProfile = true;
}

previewDocPS.make = function (saveFile, previewStyle) {

    this.doc = this.startDoc.duplicate();

    var styles = ['merged', 'layered'];

    var infoText = 'Please choose the style of the PreviewFile:\r\r';
    infoText += 'Layered -> SpotChannels are displayed as Layers, all colors are 100% opaque\r\r';
    infoText += 'Merged  -> SpotChannels are merged to flat RGB File, better opacity simulation';
    var previewStyle = previewStyle || new ButtonList('Choose Preview Style', infoText).show_dialog(styles);

	switch(previewStyle) {
		case 'merged' : this.create_merged_doc ();
		break;
		case 'layered': this.create_layered_doc();
		break;
		default :       this.create_layered_doc();
	}

	/*if no saveFile is provided, use same name and folder as sourceDoc with new extension*/
    if(!saveFile) {
    	var search = '/_(Working|Print|Druck|Sep|Preview)/i';
    	var replace = '_Preview';
    	var saveFile = this.get_saveFile(this.startDoc.doc.fullName, search, replace, 'psd');
        this.save_doc(saveFile, this.saveOps, false, true);
	} else if (saveFile instanceof File) {
        this.save_doc(saveFile, this.saveOps, false, false);
    }
}

previewDocPS.create_layers_from_channels = function (chans) {
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

/* creates a combined selection from all spotchannels
   then merge all spotchannels including t-shirt channel into rgb
   and use the created selection to make a layermask for the merged rgb image*/
previewDocPS.create_merged_doc = function () {

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

previewDocPS.create_layered_doc = function () {

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