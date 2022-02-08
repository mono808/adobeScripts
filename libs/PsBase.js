////@include "require.js"

var BaseDoc = require("BaseDoc");
var buttonList = require("buttonList");

function PsBase(initDoc) {
    BaseDoc.call(this, initDoc);
}

PsBase.prototype = Object.create(BaseDoc.prototype);
PsBase.prototype.constructor = PsBase;

PsBase.prototype.remove_component_channels = function () {
    if (this.doc.componentChannels.length > 0) {
        this.doc.activeChannels = this.doc.componentChannels;
        for (var i = this.doc.componentChannels.length - 1; i >= 0; i -= 1) {
            var chan = this.doc.channels[i];
            chan.remove();
        }
    }
    return this.doc;
};

PsBase.prototype.choose_saveFile = function (myDoc) {
    try {
        var check = myDoc.fullName;
        return myDoc.fullName;
    } catch (e) {
        var saveFile = new Folder(CSROOT + "\\kundendaten").selectDlg("Dokument wurde noch nicht gespeichert, bitte Auftragsordner wählen");
        return saveFile;
    }
};

PsBase.prototype.remove_alpha_channels = function (keepThoseChannels) {
    var i = this.doc.channels.length - 1;
    var chan;
    do {
        chan = this.doc.channels[i];
        if (keepThoseChannels && chan.name.match(keepThoseChannels)) continue;
        if (chan.kind === ChannelType.MASKEDAREA || chan.kind === ChannelType.SELECTEDAREA) {
            chan.remove();
        }
    } while (i--);
};

PsBase.prototype.reset_colors = function () {
    var idRset = charIDToTypeID("Rset");
    var desc1 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref1 = new ActionReference();
    var idClr = charIDToTypeID("Clr ");
    var idClrs = charIDToTypeID("Clrs");
    ref1.putProperty(idClr, idClrs);
    desc1.putReference(idnull, ref1);
    executeAction(idRset, desc1, DialogModes.NO);
};

PsBase.prototype.move_channel_to_index = function (idx) {
    try {
        var idmove = charIDToTypeID("move");
        var desc3 = new ActionDescriptor();
        var idnull = charIDToTypeID("null");
        var ref2 = new ActionReference();
        var idChnl = charIDToTypeID("Chnl");
        var idOrdn = charIDToTypeID("Ordn");
        var idTrgt = charIDToTypeID("Trgt");
        ref2.putEnumerated(idChnl, idOrdn, idTrgt);
        desc3.putReference(idnull, ref2);
        var idT = charIDToTypeID("T   ");
        var ref3 = new ActionReference();
        var idChnl = charIDToTypeID("Chnl");
        ref3.putIndex(idChnl, idx);
        desc3.putReference(idT, ref3);
        executeAction(idmove, desc3, DialogModes.NO);
    } catch (e) {
        alert(e);
    }
};

PsBase.prototype.activate_all_channels = function () {
    var allChans = [];
    for (var i = 0, maxI = this.doc.channels.length; i < maxI; i += 1) {
        var chan = this.doc.channels[i];
        allChans.push(chan);
    }

    this.doc.activeChannels = allChans;
    return this.doc;
};

PsBase.prototype.add_Grey_channel = function () {
    var white = new RGBColor();
    white.red = 255;
    white.green = 255;
    white.blue = 255;

    var chan = this.doc.channels.add();
    chan.name = "Grey";
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

PsBase.prototype.add_RGB_channels = function () {
    var activeChans = this.doc.activeChannels;
    this.add_Grey_channel();
    this.doc.changeMode(ChangeMode.RGB);
    this.doc.activeChannels = activeChans;
    return this.doc;
};

PsBase.prototype.check_for_pantone = function () {
    var check;
    var pantoneChannels = [];

    var i = this.doc.channels.length - 1;
    do {
        var chan = this.doc.channels[i];
        if (chan.kind !== ChannelType.COMPONENT) {
            try {
                check = chan.color;
            } catch (e) {
                pantoneChannels.push(chan.name);
            }
        }
    } while (i--);

    /*check back & foreground color 4 pantone*/
    try {
        check = app.foregroundColor;
        check = app.backgroundColor;
    } catch (e) {
        this.reset_colors();
    }

    return pantoneChannels;
};

PsBase.prototype.get_spot_channels = function (visibleOnly) {
    var spotChans = [];
    for (var i = 0, maxI = this.doc.channels.length; i < maxI; i++) {
        var chan = this.doc.channels[i];
        if (chan.kind === ChannelType.SPOTCOLOR) {
            if (visibleOnly) {
                if (chan.visible) {
                    spotChans.push(chan);
                }
            } else {
                spotChans.push(chan);
            }
        }
    }
    return spotChans;
};

PsBase.prototype.trim_doc = function () {
    var trims = ["TOPLEFT", "BOTTOMRIGHT", "NOE"];
    var trim = buttonList.show_dialog(trims, undefined, "Bild zuschneiden?");

    if (trim != "NOE") {
        this.doc.trim(TrimType[trim]);
    }
    return this.doc;
};

PsBase.prototype.make_layer_mask = function (maskType) {
    if (maskType == undefined) maskType = "RvlS";
    var desc140 = new ActionDescriptor();
    desc140.putClass(charIDToTypeID("Nw  "), charIDToTypeID("Chnl"));
    var ref51 = new ActionReference();
    ref51.putEnumerated(charIDToTypeID("Chnl"), charIDToTypeID("Chnl"), charIDToTypeID("Msk "));
    desc140.putReference(charIDToTypeID("At  "), ref51);
    desc140.putEnumerated(charIDToTypeID("Usng"), charIDToTypeID("UsrM"), charIDToTypeID(maskType));
    executeAction(charIDToTypeID("Mk  "), desc140, DialogModes.NO);
};

PsBase.prototype.delete_hidden_channels = function () {
    for (var i = this.doc.channels.length - 1; i >= 0; i--) {
        if (!this.doc.channels[i].visible) {
            this.doc.channels[i].remove();
        }
    }
};

PsBase.prototype.get_active_channels = function () {
    var activeChannels = [];
    for (var i = 0; i < this.doc.channels.length; i++) {
        if (this.doc.channels[i].visible) {
            activeChannels.push(this.doc.channels[i].name);
        }
    }
    return activeChannels;
};

PsBase.prototype.get_guide_location = function () {
    var defaultPos = {
        x: new UnitValue((this.doc.width.value / 2) * -1, "mm"),
        y: new UnitValue(80, "mm")
    };

    if (this.doc.guides.length > 0 && this.doc.guides.length < 3) {
        var guidePos = {};
        var hasVerticalGuide = false;

        for (var i = 0; i < this.doc.guides.length; i += 1) {
            var myGuide = this.doc.guides[i];
            if (myGuide.direction === Direction.VERTICAL) {
                hasVerticalGuide = true;
                guidePos.x = myGuide.coordinate * -1;
            } else {
                guidePos.y = myGuide.coordinate * -1;
            }
        }

        var info = "Dokument enthält Hilfslinien. Sollen diese zur Platzierung verwenden werden?";
        info += "\n\nBenötigt wird genau eine vertikale Hilflinie zur Markierung der Shirt-/ Beutelmitte.";
        info += "Optional ist eine zweite waagerechte HL zur Markierung der Kragennaht / Taschenkante";
        if (hasVerticalGuide && Window.confirm(info)) {
            guidePos.y = guidePos.y || defaultPos.y;
            return guidePos;
        }
    } else {
        alert("Dokument enthält keine oder zu viele Hilfslinien, Motiv wird mittig platziert!");
        return defaultPos;
    }
};

PsBase.prototype.checkBitsPerChannel = function (requiredValues) {
    var savedState = this.doc.activeHistoryState;
    var oldValue = this.doc.bitsPerChannel;
    var shortNames = {
        "BitsPerChannelType.ONE": "1-bit",
        "BitsPerChannelType.EIGHT": "8-bit",
        "BitsPerChannelType.SIXTEEN": "16-bit",
        "BitsPerChannelType.THIRTYTWO": "32-bit"
    };

    if (!requiredValues.includes(oldValue)) {
        var msg = "Aktuelle Bittiefe ist " + shortNames[oldValue.toString()];
        msg += "\r\rBenötigt wird " + requiredValues.join(" oder ");
        msg += "\r\rMotiv wird zu " + shortNames[requiredValues[0].toString()] + " umgewandelt";
        alert(msg);
        this.doc.bitsPerChannel = requiredValues[0];
        app.refresh();
        if (!Window.confirm("Grafik nock ok?")) {
            this.doc.activeHistoryState = savedState;
            return false;
        }
    }

    return true;
};

PsBase.prototype.checkDocumentMode = function (requiredValues) {
    var savedState = this.doc.activeHistoryState;
    var oldValue = this.doc.mode;
    var shortNames = {
        "DocumentMode.GRAYSCALE": "Graustufen",
        "DocumentMode.RGB": "RGB",
        "DocumentMode.CMYK": "CMYK",
        "DocumentMode.LAB": "LAB",
        "DocumentMode.BITMAP": "Bitmap",
        "DocumentMode.INDEXEDCOLOR": "IndizierteFarben",
        "DocumentMode.MULTICHANNEL": "Mehrkanal",
        "DocumentMode.DUOTONE": "Duotone"
    };

    if (!requiredValues.includes(oldValue)) {
        var msg = "Aktueller Farbmodus ist " + shortNames[oldValue.toString()];
        msg += "\r\rBenötigt wird " + requiredValues.join(" oder ");
        msg += "\r\rMotiv wird zu RGB umgewandelt";
        alert(msg);
        this.doc.changeMode(ChangeMode.RGB);
        app.refresh();
        if (!Window.confirm("Grafik nock ok?")) {
            this.doc.activeHistoryState = savedState;
            return false;
        }
    }
    return true;
};

//var psBaseDoc = new PsBase(app.activeDocument);
//psBaseDoc.get_guide_location ();

exports = module.exports = PsBase;
