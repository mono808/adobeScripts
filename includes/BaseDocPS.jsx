#include './BaseDoc.jsx'
/*////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

BaseDocPS

//////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////*/

function BaseDocPS (initDoc) {
	BaseDoc.call(this, initDoc);
}
BaseDocPS.prototype = Object.create(BaseDoc.prototype);
BaseDocPS.prototype.constructor = BaseDocPS;

BaseDocPS.prototype.remove_component_channels = function () {
    if (this.doc.componentChannels.length > 0) {
        this.doc.activeChannels = this.doc.componentChannels;
        for (var i = this.doc.componentChannels.length-1; i >= 0; i-=1) {
            var chan = this.doc.channels[i];
            chan.remove();
        };
    };
    return this.doc;
};

BaseDocPS.prototype.remove_alpha_channels = function (containTeeChannel) {
    var teeNames = /^(t|tee|shirt|tasche|beutel)$/i;
    var i = this.doc.channels.length-1;
    do{
        var chan = this.doc.channels[i];
        if(chan.kind === ChannelType.MASKEDAREA || chan.kind === ChannelType.SELECTEDAREA) {
            if(chan.name.match(teeNames)) {
                var teeColor = chan.color;
                if(containTeeChannel) {
                    continue;
                }
            }
            chan.remove();
        };
    }while(i--);

    return teeColor;
};

BaseDocPS.prototype.reset_colors = function () {
    var idRset = charIDToTypeID( "Rset" );
    var desc1 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref1 = new ActionReference();
    var idClr = charIDToTypeID( "Clr " );
    var idClrs = charIDToTypeID( "Clrs" );
    ref1.putProperty( idClr, idClrs );
    desc1.putReference( idnull, ref1 );
    executeAction( idRset, desc1, DialogModes.NO );
};

BaseDocPS.prototype.move_channel_to_index = function (idx) {
    try {
        var idmove = charIDToTypeID( "move" );
        var desc3 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var ref2 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref2.putEnumerated( idChnl, idOrdn, idTrgt );
        desc3.putReference( idnull, ref2 );
        var idT = charIDToTypeID( "T   " );
        var ref3 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        ref3.putIndex( idChnl, idx );
        desc3.putReference( idT, ref3 );
        executeAction( idmove, desc3, DialogModes.NO );
    } catch (e) {alert(e)};
};

BaseDocPS.prototype.activate_all_channels = function () {
 	var allChans = [];
    for(var i = 0, maxI = this.doc.channels.length; i < maxI; i += 1) {
        var chan = this.doc.channels[i];
        allChans.push(chan);
    }

    this.doc.activeChannels = allChans;
    return this.doc;
};

BaseDocPS.prototype.add_Grey_channel = function () {

    var white = new RGBColor();
    white.red = 255;
    white.green = 255;
    white.blue = 255;

    var chan = this.doc.channels.add();
    chan.name = 'Grey';
    chan.kind = ChannelType.SPOTCOLOR;
    this.doc.selection.load(chan);
    this.doc.selection.fill(white);
    this.doc.activeChannels = [chan];
    this.move_channel_to_index(1);

    this.doc.changeMode(ChangeMode.GRAYSCALE);
    var bgLayer = this.doc.artLayers[0];
    bgLayer.isBackgroundLayer = false;

    this.doc.selection.selectAll();
    this.doc.selection.clear();

    return this;
};

BaseDocPS.prototype.add_RGB_channels = function () {
    var activeChans = this.doc.activeChannels;
    this.add_Grey_channel();
    this.doc.changeMode(ChangeMode.RGB);
    this.doc.activeChannels = activeChans;
    return this.doc;
};

BaseDocPS.prototype.check_for_pantone = function () {

    var check;
    var pantoneChannels = [];

    var i = this.doc.channels.length-1;
    do {
        var chan = this.doc.channels[i];
        if (chan.kind !== ChannelType.COMPONENT){
            try { check = chan.color; }
            catch (e) { pantoneChannels.push(chan.name); }
        }
    } while (i--)

    /*check back & foreground color 4 pantone*/
    try{
        check = app.foregroundColor;
        check = app.backgroundColor;
    } catch(e) {
        this.reset_colors();
    }

    return pantoneChannels;
};

BaseDocPS.prototype.get_spot_channels = function (visibleOnly) {
    var spotChans = [];
    for (var i = 0, maxI = this.doc.channels.length; i<maxI; i++) {
    	var chan = this.doc.channels[i];
        if (chan.kind === ChannelType.SPOTCOLOR) {
            if(visibleOnly) {
                if(chan.visible) {
                    spotChans.push(chan);
                }
            } else {
                spotChans.push(chan);
            }
        };
    }
    return spotChans;
};

BaseDocPS.prototype.trim_doc = function () {
    var trims = ['TOPLEFT', 'BOTTOMRIGHT', 'NOE'];
    var trim = f_all.choose_from_array(trims, undefined, 'Bild zuschneiden?');
    if(trim != 'NOE') {
        this.doc.trim(TrimType[trim]);
    }
    return this.doc;
};

BaseDocPS.prototype.make_layer_mask = function (maskType) {
    if( maskType == undefined) maskType = 'RvlS';
    var desc140 = new ActionDescriptor();
        desc140.putClass( charIDToTypeID('Nw  '), charIDToTypeID('Chnl') );
    var ref51 = new ActionReference();
        ref51.putEnumerated( charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Msk ') );
    desc140.putReference( charIDToTypeID('At  '), ref51 );
    desc140.putEnumerated( charIDToTypeID('Usng'), charIDToTypeID('UsrM'), charIDToTypeID(maskType) );
    executeAction( charIDToTypeID('Mk  '), desc140, DialogModes.NO );
};

BaseDocPS.prototype.check_histogram = function (chan) {
    var visState = chan.visible;
    if(!visState) {chan.visible = true;}

    var hg = chan.histogram;
    var totalPixels = chan.parent.width.as('px') * chan.parent.height.as('px');
    var totalArea = chan.parent.width.as('cm') * chan.parent.height.as('cm');
    var i = 254;
    // blackness = overall darkness of the channel = ink coverage on press
    // 100% black pixel -> darkness +1, 50% black pixel -> darkness +0.5
    // hg[0] -> amount of 100% black pixels
    var blackness = hg[0];
    var greyPixels = 0;

    do {
        blackness += hg[i]*((255-i)/255);
        greyPixels += hg[i]; //counting greyPixels to check if channel is bitmapped -> only black/white pixels
        i--;
    }while(i>0)

    chan.visible = visState;

    return {
        name : chan.name,
        inkCoverage : blackness/totalPixels,
        area : totalArea*(blackness/totalPixels),
        // if the overall blackness equals the number of black pixels
        // -> there must be no grey pixels -> true 1bit bitmap
        isOneBit : (greyPixels == 0)
    };
};

BaseDocPS.prototype.find_tee_channel = function () {
	var teeNames = /^(t|tee|shirt|tasche|beutel)$/i;

    for (var i = this.doc.componentChannels.length, maxI = this.doc.channels.length; i < maxI; i++) {
        var chan = this.doc.channels[i];
        var rep = this.check_histogram(chan);
        var inked100 = rep.inkCoverage >= 1;
        var nameMatches = chan.name.match(teeNames);
        if(inked100 || nameMatches) {
            var confirmStr = '';
            confirmStr += 'The Channel "';
            confirmStr += chan.name;
            confirmStr += '" looks like the t-shirt channel.\n Is this correct?';

            if(Window.confirm(confirmStr)) {
            	return chan;
            }
        }
    }
};

BaseDocPS.prototype.check_for_tee_channel= function () {
    var iaSwitch = new InteractSwitch();
    iaSwitch.set('all');

    for (var i = this.doc.channels.length - 1; i >= 0; i--) {
        var chan = this.doc.channels[i];
        rep = this.check_histogram(chan);
        if(rep.inkCoverage >= 1) {
            var confirmStr = '';
            confirmStr += 'The Channel "';
            confirmStr += chan.name;
            confirmStr += '" looks like the t-shirt channel.\n Do you want to remove it for film output?';

            if(Window.confirm(confirmStr)) {
                return chan;
            }
        }
    }
    iaSwitch.reset();
    return false;
};

BaseDocPS.prototype.create_tee_channel = function () {
    if(!Window.confirm('T-Shirt Kanal erstellen?')) return null;

    var oldForegroundColor = app.foregroundColor;
    var oldActiveChans = this.doc.activeChannels;

    //reset_colors();

    var visChans = [];
    for(var i = 0, maxI = this.doc.channels.length; i < maxI; i++) {
        var chan = this.doc.channels[i];
        if(chan.visible && chan.kind == ChannelType.SPOTCOLOR) visChans.push(chan);
    }

    //this.doc.activeChannels = this.doc.componentChannels;
    app.showColorPicker();
    var myColor = app.foregroundColor;
    var teeChan = this.doc.channels.add();
    teeChan.name = 'Tee';
    teeChan.kind = ChannelType.SPOTCOLOR;
    teeChan.color = myColor;
    teeChan.opacity = 100;

    if(this.doc.componentChannels.length < 1) {
        this.add_RGB_channels ();
    }

    this.move_channel_to_index(this.doc.componentChannels.length+1);

    this.doc.activeChannels = oldActiveChans;
    for(var i = 0; i < visChans.length; i++) {
        visChans[i].visible = true;
    }

    app.foregroundColor = oldForegroundColor;

    teeChan.visible = true;
    return teeChan;
};

BaseDocPS.prototype.delete_hidden_channels = function () {
    for (var i = this.doc.channels.length-1; i >= 0; i--) {
        if(!this.doc.channels[i].visible) {
            this.doc.channels[i].remove();
        }
    }
};

BaseDocPS.prototype.get_active_channels = function () {
    var activeChannels = [];
    for (var i = 0; i < this.doc.channels.length; i++) {
        if(this.doc.channels[i].visible) {
            activeChannels.push(this.doc.channels[i].name);
        }
    }
    return activeChannels;
}
