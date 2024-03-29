﻿//@target photoshop
//@include "require.js"

var PsBase = require("PsBase");
var f_all = require("f_all");

var remove_component_channels = function () {
    var doc = activeDocument,
        i,
        chan;

    if (
        doc.mode == DocumentMode.CMYK ||
        doc.mode == DocumentMode.RGB ||
        doc.mode == DocumentMode.GRAYSCALE
    ) {
        doc.activeChannels = doc.componentChannels;
        for (i = doc.componentChannels.length - 1; i >= 0; i -= 1) {
            chan = doc.channels[i];
            chan.remove();
        }
    }
};

var activate_all_channels = function () {
    var doc = app.activeDocument,
        allChans = [],
        i,
        maxI,
        chan;

    for (i = 0, maxI = doc.channels.length; i < maxI; i += 1) {
        chan = doc.channels[i];
        allChans.push(chan);
    }
    doc.activeChannels = allChans;
};

function rastern() {
    var settings = get_raster_settings();
    if (!settings) {
        alert("Script cancelled!");
        return;
    }

    var diagMode = app.displayDialogs,
        originalRulerUnits = app.preferences.rulerUnits;
    app.displayDialogs = DialogModes.NO;
    app.preferences.rulerUnits = Units.CM;

    var srcDoc = app.activeDocument;
    var tempDoc = srcDoc.duplicate("tempDoc");
    //tempDoc.name = 'tempDoc';

    // remove Alphachannels and return color of Shirt-Channel
    //var teeColor = remove_alpha_channels(tempDoc);

    if (tempDoc.bitsPerChannel != BitsPerChannelType.EIGHT) {
        tempDoc.bitsPerChannel = BitsPerChannelType.EIGHT;
    }

    // remove component channels not needed for halftoning
    remove_component_channels(tempDoc);

    // activate first channel only
    var targetDoc = tempDoc.duplicate("targetDoc");
    //targetDoc.name = 'targetDoc';
    targetDoc.channels[0].visible = true;
    targetDoc.activeChannels = [activeDocument.channels[0]];

    // store channel parameters for recreating the settings on haltoned channel after bitmapping
    var chan = targetDoc.channels[0];
    var c = {
        kind: chan.kind,
        name: chan.name,
        color: chan.color,
        opacity: chan.opacity
    };

    //bitmap the activeChannel with user defined settings
    convert_to_bitmap(targetDoc, settings);

    //convert file back to multichannel, so other (halftoned)spot channels can be added
    convert_bitmap_to_multichannel(targetDoc);

    //reset the spotchannel properties to the previously backed up settings
    //targetDoc.channels[0].kind = c.kind;
    targetDoc.channels[0].name = c.name;
    targetDoc.channels[0].color = c.color;
    targetDoc.channels[0].opacity = c.opacity;

    //save history state, to reset the tempDoc after bitmapping a singel channel (which removes the others)
    app.activeDocument = tempDoc;
    var myHistoryState = tempDoc.activeHistoryState;

    //halftone the remaining channels in tempDoc
    //and copy them one by one to targetDoc
    var i, maxI;
    for (i = 1, maxI = tempDoc.channels.length; i < maxI; i += 1) {
        chan = tempDoc.channels[i];
        chan.visible = true;
        tempDoc.activeChannels = [chan];

        c.name = chan.name;
        c.kind = chan.kind;
        c.color = chan.color;
        c.opacity = chan.opacity;

        //convert selected channel to Bitmap, all other channels are deleted
        convert_to_bitmap(tempDoc, settings);
        convert_bitmap_to_multichannel(tempDoc);
        tempDoc.channels[0].duplicate(targetDoc);

        app.activeDocument = targetDoc;
        chan = targetDoc.channels[targetDoc.channels.length - 1];
        //chan.kind = c.kind;
        chan.name = c.name;
        chan.color = c.color;
        chan.opacity = c.opacity;

        // revert back to history state with all channels intact, and repeat steps with next channel
        app.activeDocument = tempDoc;
        tempDoc.activeHistoryState = myHistoryState;
    }

    tempDoc.close(SaveOptions.DONOTSAVECHANGES);

    //readd the Shirt-AlphaChannel if there was an Shirt-Channel in the original file
    /*
    if(teeColor) {
        add_tee_channel(targetDoc, teeColor);
    }
    */

    activate_all_channels();

    var saveFile = get_save_file(srcDoc, settings);
    if (saveFile) targetDoc.saveAs(saveFile);

    app.displayDialogs = diagMode;
    app.preferences.rulerUnits = originalRulerUnits;

    // ---------------------------------------------------------
    // Functions
    // ---------------------------------------------------------

    function move_channel_to_index(idx) {
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
        } catch (e) {}
    }

    function add_tee_channel(doc, teeColor) {
        app.activeDocument = doc;
        var teeChan = doc.channels.add(),
            fillColor = new SolidColor();

        fillColor.rgb.red = 0;
        fillColor.rgb.green = 0;
        fillColor.rgb.blue = 0;

        teeChan.kind = ChannelType.SELECTEDAREA;
        teeChan.color = teeColor;
        teeChan.opacity = 100;
        teeChan.name = "Shirt";
        doc.activeChannels = [teeChan];
        doc.selection.selectAll();
        doc.selection.fill(fillColor);
        doc.selection.deselect();
        move_channel_to_index(1);
    }

    function get_save_file(srcDoc, settings) {
        if (srcDoc.saved && srcDoc.fullName && srcDoc.fullName.parent) {
            var srcName = srcDoc.name;
            var srcPath = srcDoc.fullName.parent;
            var saveName = srcName;
            var saveFile;

            if (saveName.indexOf(".") < 0) {
                saveName = saveName.substring(0, saveName.lastIndexOf("."));
            }
            saveName += "-RS";
            saveName += settings.lpi;
            saveName += ".psd";

            saveFile = new File(srcPath + "/" + saveName);
            return saveFile;
        } else {
            return null;
        }
    }

    function convert_bitmap_to_multichannel(doc) {
        app.activeDocument = doc;

        var id97 = charIDToTypeID("CnvM");
        var desc18 = new ActionDescriptor();
        var id98 = charIDToTypeID("T   ");
        var desc19 = new ActionDescriptor();
        var id99 = charIDToTypeID("Rt  ");
        desc19.putInteger(id99, 1);
        var id100 = charIDToTypeID("Grys");
        desc18.putObject(id98, id100, desc19);
        executeAction(id97, desc18, DialogModes.NO);

        var id101 = charIDToTypeID("CnvM");
        var desc20 = new ActionDescriptor();
        var id102 = charIDToTypeID("T   ");
        var id103 = charIDToTypeID("MltC");
        desc20.putClass(id102, id103);
        executeAction(id101, desc20, DialogModes.NO);

        return doc;
    }

    function convert_to_bitmap(doc, settings) {
        var chan = doc.activeChannels[0];
        var s = settings;
        var bmpConvOpts = new BitmapConversionOptions();

        bmpConvOpts.method = BitmapConversionType.HALFTONESCREEN;
        bmpConvOpts.angle = chan.name === "sisBlack" ? s.wnklK : s.wnkl;
        bmpConvOpts.frequency = s.lpi;
        bmpConvOpts.resolution = s.res;
        bmpConvOpts.shape = s.dot;

        doc.changeMode(ChangeMode.BITMAP, bmpConvOpts);
        return doc;
    }

    function get_raster_settings() {
        var bmpConvert = {
            Round: "BitmapHalfToneType.ROUND",
            Diamond: "BitmapHalfToneType.DIAMOND",
            Ellipse: "BitmapHalfToneType.ELLIPSE",
            Line: "BitmapHalfToneType.LINE",
            Square: "BitmapHalfToneType.SQUARE",
            Cross: "BitmapHalfToneType.CROSS"
        };

        var bmpList = ["Round", "Diamond", "Ellipse", "Line", "Square", "Cross"];

        var resList = [300, 600, 720, 900, 1200, 1440];

        var lpiList = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75];

        var result = {};

        var win = new Window("dialog", "monos Raster-Script");

        win.setPnl = win.add("panel", [10, 10, 240, 225], "Raster-Einstellungen:");
        win.okGrp = win.add("group", [10, 235, 240, 265], "Ready?");

        win.setPnl.lpi = win.setPnl.add("group", [5, 10, 225, 45]);
        win.setPnl.wnkl = win.setPnl.add("group", [5, 50, 225, 85]);
        win.setPnl.wnklK = win.setPnl.add("group", [5, 90, 225, 125]);
        win.setPnl.res = win.setPnl.add("group", [5, 130, 225, 165]);
        win.setPnl.dot = win.setPnl.add("group", [5, 170, 225, 205]);

        win.setPnl.lpi.txt = win.setPnl.lpi.add(
            "statictext",
            [5, 5, 130, 25],
            "LPI (Linien pro Zoll):"
        );
        win.setPnl.lpi.set = win.setPnl.lpi.add("dropdownlist", [135, 5, 210, 25], 55);

        win.setPnl.wnkl.txt = win.setPnl.wnkl.add("statictext", [5, 5, 160, 25], "Rasterwinkel:");
        win.setPnl.wnkl.set = win.setPnl.wnkl.add("edittext", [165, 5, 210, 25], 162);

        win.setPnl.wnklK.txt = win.setPnl.wnklK.add(
            "statictext",
            [5, 5, 160, 25],
            "Rasterwinkel sisBlack:"
        );
        win.setPnl.wnklK.set = win.setPnl.wnklK.add("edittext", [165, 5, 210, 25], 12);

        win.setPnl.res.txt = win.setPnl.res.add("statictext", [5, 5, 130, 25], "Auflösung:");
        win.setPnl.res.set = win.setPnl.res.add("dropdownlist", [135, 5, 210, 25], 900);

        win.setPnl.dot.txt = win.setPnl.dot.add("statictext", [5, 5, 130, 25], "Punktform:");
        win.setPnl.dot.set = win.setPnl.dot.add("dropdownlist", [135, 5, 210, 25], "Ellipse");

        win.okGrp.yes = win.okGrp.add("button", [10, 5, 110, 30], "Ok");
        win.okGrp.no = win.okGrp.add("button", [120, 5, 220, 30], "Abbrechen");

        var i, maxI, item;

        for (i = 0, maxI = lpiList.length; i < maxI; i += 1) {
            item = win.setPnl.lpi.set.add("item", lpiList[i]);
        }
        win.setPnl.lpi.set.selection = win.setPnl.lpi.set.items[9];

        for (i = 0, maxI = resList.length; i < maxI; i += 1) {
            item = win.setPnl.res.set.add("item", resList[i]);
        }
        win.setPnl.res.set.selection = win.setPnl.res.set.items[2];

        for (i = 0, maxI = bmpList.length; i < maxI; i += 1) {
            item = win.setPnl.dot.set.add("item", bmpList[i]);
        }
        win.setPnl.dot.set.selection = win.setPnl.dot.set.items[2];

        win.okGrp.yes.onClick = function () {
            if (
                f_all.is_number(win.setPnl.wnkl.set.text) &&
                f_all.is_number(win.setPnl.wnklK.set.text)
            ) {
                result.wnkl = Number(win.setPnl.wnkl.set.text);
                result.wnklK = Number(win.setPnl.wnklK.set.text);
            } else {
                alert("Enter Numbers only!");
                return;
            }

            result.lpi = Number(win.setPnl.lpi.set.selection.text);
            result.res = Number(win.setPnl.res.set.selection.text);
            result.dot = eval(bmpConvert[win.setPnl.dot.set.selection]);
            win.close();
        };
        win.okGrp.no.onClick = function () {
            result = false;
            win.close();
        };

        win.show();
        return result;
    }
}

function check() {
    var baseDoc = new PsBase(app.activeDocument);
    var pantoneChannels = baseDoc.check_for_pantone();
    if (pantoneChannels.length > 0) {
        var alertStr = "";
        alertStr += "Dokument enthält Pantone-Farben in folgenden Kanälen:\n\n";
        alertStr += pantoneChannels.join("\n");
        alertStr += "\n\nBitte erst in RGB Farben wandeln!";
        alert(alertStr);
        return false;
    }

    if (baseDoc.get_spot_channels().length < 1) {
        alert("Document contains no SpotColor Channels, script cancelled");
        return false;
    }

    return true;
}

if (app.activeDocument && check(app.activeDocument)) {
    rastern();
}
