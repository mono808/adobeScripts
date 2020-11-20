////@include "require.js"

var PsBase = require("PsBase");

function PsSiebdruck(initDoc) {
    PsBase.call(this, initDoc);
}

PsSiebdruck.prototype = Object.create(PsBase.prototype);
PsSiebdruck.prototype.constructor = PsSiebdruck;

PsSiebdruck.prototype.check_histogram = function (chan) {
    var visState = chan.visible;
    if (!visState) {
        chan.visible = true;
    }

    var hg = chan.histogram;
    var totalPixels = chan.parent.width.as("px") * chan.parent.height.as("px");
    var totalArea = chan.parent.width.as("cm") * chan.parent.height.as("cm");
    var i = 254;
    // blackness = overall darkness of the channel = ink coverage on press
    // 100% black pixel -> darkness +1, 50% black pixel -> darkness +0.5
    // hg[0] -> amount of 100% black pixels
    var blackness = hg[0];
    var greyPixels = 0;

    do {
        blackness += hg[i] * ((255 - i) / 255);
        greyPixels += hg[i]; //counting greyPixels to check if channel is bitmapped -> only black/white pixels
        i--;
    } while (i > 0);

    chan.visible = visState;

    return {
        name: chan.name,
        inkCoverage: blackness / totalPixels,
        area: totalArea * (blackness / totalPixels),
        // if the overall blackness equals the number of black pixels
        // -> there must be no grey pixels -> true 1bit bitmap
        isOneBit: greyPixels == 0
    };
};

PsSiebdruck.prototype.find_tee_channel = function () {
    var teeNames = /^(t|tee|shirt|tasche|beutel)$/i;

    for (
        var i = this.doc.componentChannels.length,
            maxI = this.doc.channels.length;
        i < maxI;
        i++
    ) {
        var chan = this.doc.channels[i];
        var rep = this.check_histogram(chan);
        var inked100 = rep.inkCoverage >= 1;
        var nameMatches = chan.name.match(teeNames);
        if (inked100 || nameMatches) {
            var confirmStr = "";
            confirmStr += 'The Channel "';
            confirmStr += chan.name;
            confirmStr +=
                '" looks like the t-shirt channel.\n Is this correct?';

            if (Window.confirm(confirmStr)) {
                return chan;
            }
        }
    }
};

PsSiebdruck.prototype.create_tee_channel = function () {
    if (!Window.confirm("T-Shirt Kanal erstellen?")) return null;

    var oldForegroundColor = app.foregroundColor;
    var oldActiveChans = this.doc.activeChannels;

    var visChans = [];
    for (var i = 0, maxI = this.doc.channels.length; i < maxI; i++) {
        var chan = this.doc.channels[i];
        if (chan.visible && chan.kind == ChannelType.SPOTCOLOR)
            visChans.push(chan);
    }

    app.showColorPicker();
    var myColor = app.foregroundColor;
    var teeChan = this.doc.channels.add();
    teeChan.name = "Tee";
    teeChan.kind = ChannelType.SPOTCOLOR;
    teeChan.color = myColor;
    teeChan.opacity = 100;

    if (this.doc.componentChannels.length < 1) {
        this.add_RGB_channels();
    }

    this.move_channel_to_index(this.doc.componentChannels.length + 1);

    this.doc.activeChannels = oldActiveChans;
    for (var i = 0; i < visChans.length; i++) {
        visChans[i].visible = true;
    }

    app.foregroundColor = oldForegroundColor;

    teeChan.visible = true;
    return teeChan;
};

//var psSiebdruck = new PsSiebdruck (app.activeDocument);
//psSiebdruck.get_raster_settings ();

exports = module.exports = PsSiebdruck;
