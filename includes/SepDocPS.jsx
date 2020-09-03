﻿#include './BaseDocPS.jsx'
/*//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

SepDocPS

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////*/


var sepDocPS = Object.create(baseDocPS);

sepDocPS.get_guide_location = function () {
    var defaultPos = {
        x : new UnitValue(this.doc.width.value/2*-1, 'mm'),
        y : new UnitValue(80, 'mm')
    };

    if(this.doc.guides.length > 0 && this.doc.guides.length < 3) {

        var guidePos = {};
        var hasVerticalGuide = false;

        for (var i = 0; i < this.doc.guides.length; i+=1) {
            var myGuide = this.doc.guides[i];
            if (myGuide.direction === Direction.VERTICAL) {
                hasVerticalGuide = true;
                guidePos.x = myGuide.coordinate*-1;
            } else {
                guidePos.y = myGuide.coordinate*-1;
            }
        }

        var info = 'Dokument enthält Hilfslinien. Sollen diese zur Platzierung verwenden werden?';
        info += '\n\nBenötigt wird genau eine vertikale Hilflinie zur Markierung der Shirt-/ Beutelmitte.';
        info += 'Optional ist eine zweite waagerechte HL zur Markierung der Kragennaht / Taschenkante';
        if(hasVerticalGuide && Window.confirm(info))
        {
            guidePos.y = guidePos.y || defaultPos.y;
            return guidePos;
        }
    } else {
        alert('Dokument enthält keine oder zu viele Hilfslinien, Motiv wird mittig platziert!');
        return defaultPos;
    }
};

sepDocPS.recolor_white_spotchannels = function () {

    var ubNames = /^(Unterleger|UL|UB|Underbase|Weiß1|Vordruck)$/i;
    var w1Names = /^(Weiß|White|Weiß2|HL)$/i;
    var dWNames = /^(UL\+Weiß|UB\+White|UB\+|Weiß1&2|Weiß1\+2)$/i;

    for (var i = 0, maxI = this.doc.channels.length; i < maxI; i += 1) {
        var chan = this.doc.channels[i];
        if(chan.name.match(/weiss/gi)) chan.name.replace(/weiss/gi, 'Weiß');
        if(chan.kind === ChannelType.SPOTCOLOR) {
            if(chan.name.match(ubNames)) {
                var chanColor = new SolidColor();
                chanColor.hsb.brightness = 100;
                chanColor.hsb.hue = 300;
                chanColor.hsb.saturation = 20;
                chan.color = chanColor;
            } else if (chan.name.match(w1Names)) {
                chanColor = new SolidColor();
                chanColor.hsb.brightness = 100;
                chanColor.hsb.hue = 120;
                chanColor.hsb.saturation = 20;
                chan.color = chanColor;
            } if (chan.name.match(dWNames)) {
                chanColor = new SolidColor();
                chanColor.hsb.brightness = 100;
                chanColor.hsb.hue = 210;
                chanColor.hsb.saturation = 20;
                chan.color = chanColor;
            }
        }
    }
    return this.doc;
};

sepDocPS.rename_cmyk = function () {
    var forbiddenNames = /^(Cyan|Magenta|Yellow|Gelb|Black|Schwarz)$/i;
    var renamedChans = [];
    var i = this.doc.channels.length-1;
    do {
        var chan = this.doc.channels[i];
        if(chan.kind === ChannelType.SPOTCOLOR) {
            if(forbiddenNames.test(chan.name) ){
                renamedChans.push(chan.name);
                chan.name += ' Ink'
                renamedChans.push(chan.name);
            }
        }
    }while(i--)

    if(renamedChans.length > 0) {
        var alertString = 'Reserved Channel-Names have been renamed:\r'
        for(i = 0; i < renamedChans.length; i+=2) {
            alertString += renamedChans[i] + ' -> ' + renamedChans[i+1] + '\n';
        };
        alert(alertString);
    }
    return renamedChans;
};

sepDocPS.save_dcs2 = function (saveFile) {
    var idsave = charIDToTypeID( "save" );
        var desc2 = new ActionDescriptor();
        var idAs = charIDToTypeID( "As  " );
            var desc3 = new ActionDescriptor();
            var idPrvw = charIDToTypeID( "Prvw" );
            var idEPSP = charIDToTypeID( "EPSP" );
            var idTIFF = charIDToTypeID( "TIFF" );
            desc3.putEnumerated( idPrvw, idEPSP, idTIFF );
            var idDpth = charIDToTypeID( "Dpth" );
            var idDpth = charIDToTypeID( "Dpth" );
            var idEghB = charIDToTypeID( "EghB" );
            desc3.putEnumerated( idDpth, idDpth, idEghB );
            var idDCS = charIDToTypeID( "DCS " );
            var idDCS = charIDToTypeID( "DCS " );
            var idseventwoCS = charIDToTypeID( "72CS" );
            desc3.putEnumerated( idDCS, idDCS, idseventwoCS );
            var idEncd = charIDToTypeID( "Encd" );
            var idEncd = charIDToTypeID( "Encd" );
            var idASCI = charIDToTypeID( "ASCI" );
            desc3.putEnumerated( idEncd, idEncd, idASCI );
            var idHlfS = charIDToTypeID( "HlfS" );
            desc3.putBoolean( idHlfS, false );
            var idTrnF = charIDToTypeID( "TrnF" );
            desc3.putBoolean( idTrnF, false );
            var idClMg = charIDToTypeID( "ClMg" );
            desc3.putBoolean( idClMg, false );
            var idIntr = charIDToTypeID( "Intr" );
            desc3.putBoolean( idIntr, false );
        var idPhDtwo = charIDToTypeID( "PhD2" );
        desc2.putObject( idAs, idPhDtwo, desc3 );
        var idIn = charIDToTypeID( "In  " );
        desc2.putPath( idIn, saveFile );
        var idDocI = charIDToTypeID( "DocI" );
        desc2.putInteger( idDocI, 37 );
        var idsaveStage = stringIDToTypeID( "saveStage" );
        var idsaveStageType = stringIDToTypeID( "saveStageType" );
        var idsaveBegin = stringIDToTypeID( "saveBegin" );
        desc2.putEnumerated( idsaveStage, idsaveStageType, idsaveBegin );
    executeAction( idsave, desc2, DialogModes.NO );
};

sepDocPS.save_psd = function (saveFile) {
    var saveOptions = new PhotoshopSaveOptions ();
    saveOptions.alphaChannels = true;
    saveOptions.spotColors = true;
    saveOptions.layers = true;
    saveOptions.embedColorProfile = true;
    app.activeDocument.saveAs(saveFile, saveOptions);
}

sepDocPS.get_histogram_reports = function () {

    var oldUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;

    var histogramReports = [];
    for(var i=0, maxI = this.doc.channels.length; i < maxI; i+=1) {
        var chan = this.doc.channels[i];
        if(chan.kind == ChannelType.SPOTCOLOR) {
            histogramReports.push(this.check_histogram(chan));
        }
    }
    app.preferences.rulerUnits = oldUnits;

    return histogramReports;
};

sepDocPS.show_histogramReport_dialog = function (reports) {
    var retval = false;
    var w = new Window("dialog", 'Channels Report');
    w.orientation = 'column';

        var tablePnl = w.add('panel');
        tablePnl.orientation = 'row'

            var nameGrp = tablePnl.add('group');
            nameGrp.orientation = 'column';
            nameGrp.add('statictext',undefined, 'Channel Name:');

            var covGrp = tablePnl.add('group');
            covGrp.orientation = 'column';
            covGrp.add('statictext',undefined, 'Ink Coverage:');

            var areaGrp = tablePnl.add('group');
            areaGrp.orientation = 'column';
            areaGrp.add('statictext',undefined, 'Ink Area:');

            var bitGrp = tablePnl.add('group');
            bitGrp.orientation = 'column';
            bitGrp.add('statictext',undefined, 'Is 1bit:');

            var i, rep, stxt, totalInkCoverage = 0, allOneBit = true;
            for(i=0; i < reports.length; i+=1) {
                rep = reports[i];
                totalInkCoverage += rep.inkCoverage;
                if(!rep.isOneBit) allOneBit = false;
                nameGrp.add('statictext',undefined,rep.name);
                covGrp.add('statictext',undefined,(rep.inkCoverage*100).toFixed(0) + ' %');
                areaGrp.add('statictext',undefined,(rep.area).toFixed(0) + ' cm²');
                bitGrp.add('statictext',undefined,rep.isOneBit ? 'YES' : 'NO');
            }
            /*last row for the overall info*/
            /* nameGrp.add('statictext',undefined,'TOTAL:');
            covGrp.add('statictext',undefined,(totalInkCoverage*100).toFixed(0) + ' %');
            bitGrp.add('statictext',undefined, allOneBit ? 'YES' : 'NO'); */

        var btnGrp = w.add('group');
        btnGrp.orientation = 'row';
            var okBtn = btnGrp.add('button', undefined, 'Ok');
            var cclBtn = btnGrp.add('button', undefined, 'Cancel');
            okBtn.onClick = function() {
                retval = true;
                w.close();
            };
            cclBtn.onClick = function() {
                retval = false;
                w.close();
            };

    w.show();
    return retval;
};

sepDocPS.get_raster_settings = function () {

    var bmpConvert = {
        Round : 'BitmapHalfToneType.ROUND',
        Diamond : 'BitmapHalfToneType.DIAMOND',
        Ellipse : 'BitmapHalfToneType.ELLIPSE',
        Line : 'BitmapHalfToneType.LINE',
        Square : 'BitmapHalfToneType.SQUARE',
        Cross : 'BitmapHalfToneType.CROSS'
    };

    var bmpList = [
        'Round',
        'Diamond',
        'Ellipse',
        'Line',
        'Square',
        'Cross'
    ];

    var resList = [300,600,720,900,1200,1440];

    var lpiList = [10,15,20,25,30,35,40,45,50,55,60];

    var result = {};

    var win = new Window('dialog', 'monos Raster-Script');

    win.setPnl = win.add('panel', [10,  10, 240, 225], 'Raster-Einstellungen:');
    win.okGrp =  win.add('group', [10, 235, 240, 265], 'Ready?');

    win.setPnl.lpi =   win.setPnl.add('group',[5,  10, 225,  45]);
    win.setPnl.wnkl =  win.setPnl.add('group',[5,  50, 225,  85]);
    win.setPnl.wnklK = win.setPnl.add('group',[5,  90, 225, 125]);
    win.setPnl.res =   win.setPnl.add('group',[5, 130, 225, 165]);
    win.setPnl.dot =   win.setPnl.add('group',[5, 170, 225, 205]);

    win.setPnl.lpi.txt = win.setPnl.lpi.add('statictext', [5,5,130,25], 'LPI (Linien pro Zoll):');
    win.setPnl.lpi.set = win.setPnl.lpi.add('dropdownlist', [135,5,210,25], 55);

    win.setPnl.wnkl.txt = win.setPnl.wnkl.add('statictext',[5,5,160,25], 'Rasterwinkel:');
    win.setPnl.wnkl.set = win.setPnl.wnkl.add('edittext', [165,5,210,25], 165);

    win.setPnl.wnklK.txt = win.setPnl.wnklK.add('statictext',[5,5,160,25], 'Rasterwinkel sisBlack:');
    win.setPnl.wnklK.set = win.setPnl.wnklK.add('edittext', [165,5,210,25], 15);

    win.setPnl.res.txt = win.setPnl.res.add('statictext',[5,5,130,25], 'Auflösung:');
    win.setPnl.res.set = win.setPnl.res.add('dropdownlist', [135,5,210,25], 900);

    win.setPnl.dot.txt = win.setPnl.dot.add('statictext',     [5,5,130,25], 'Punktform:');
    win.setPnl.dot.set = win.setPnl.dot.add('dropdownlist',  [135,5,210,25], 'Ellipse');

    win.okGrp.yes = win.okGrp.add('button', [10, 5, 110, 30], 'Ok');
    win.okGrp.no =  win.okGrp.add('button', [120, 5, 220, 30], 'Abbrechen');

    for (var i = 0, maxI = lpiList.length; i < maxI; i += 1) {
        win.setPnl.lpi.set.add('item', lpiList[i]);
    };
    win.setPnl.lpi.set.selection = win.setPnl.lpi.set.items[9];

    for (var i = 0, maxI = resList.length; i < maxI; i += 1) {
        win.setPnl.res.set.add('item', resList[i]);
    };
    win.setPnl.res.set.selection = win.setPnl.res.set.items[2];

    for (var i = 0, maxI = bmpList.length; i < maxI; i += 1) {
        win.setPnl.dot.set.add('item', bmpList[i]);
    };
    win.setPnl.dot.set.selection = win.setPnl.dot.set.items[2];

    win.okGrp.yes.onClick = function () {

        if(is_number(win.setPnl.wnkl.set.text) && is_number(win.setPnl.wnklK.set.text)) {
            result.wnkl = Number(win.setPnl.wnkl.set.text);
            result.wnklK = Number(win.setPnl.wnklK.set.text);
        } else {
            alert('Enter Numbers only!');
            return
        }

        result.lpi = Number(win.setPnl.lpi.set.selection.text);
        result.res = Number(win.setPnl.res.set.selection.text);
        result.dot = eval(bmpConvert[win.setPnl.dot.set.selection]);
        win.close();
    }
    win.okGrp.no.onClick = function() {
        result = false;
        win.close();
    };

    win.show();
    return result;
};

sepDocPS.get_sep_fileformat_dialog = function () {
    var returnValue = {
        isSpot : null
    };

    var screen = $.screens[0];
    var width = screen.right-screen.left;
    centerWidth = screen.left + width/2;
    var height = screen.bottom-screen.top;
    centerHeight = screen.top + height/2;

    var dialogWidth = 225;
    var dialogHeight = 200;
    var dLeft = centerWidth-dialogWidth/2;
    var dRight = centerWidth+dialogWidth/2;
    var dTop = centerHeight-dialogHeight/2;
    var dBottom = centerHeight+dialogHeight/2;

    //var win = new Window("dialog", "Vollton oder Raster",[dLeft,dTop,dRight,dBottom]);
    var win = new Window("dialog", "Neutral Ansicht erstellen?",undefined);
    this.windowRef = win;
    win.presetGroup = win.add("group",undefined,'presetGroup');
    win.presetGroup.spotButton = win.presetGroup.add("button",[15,15,105,100],"PSD");
    win.presetGroup.htButton = win.presetGroup.add("button",[120, 15, 210, 100], "EPS");

    // Register event listeners that define the button behavior
    win.presetGroup.spotButton.onClick = function () {
        returnValue.isSpot = true;
        returnValue.fileName = 'sepPsPSD';
        win.close();
    }

    win.presetGroup.htButton.onClick = function () {
        returnValue.isSpot = false;
        returnValue.fileName = 'sepPsEPS';
        win.close();
    }

    // Display the window
    win.show();
        
    return returnValue;
}


sepDocPS.make = function (saveFile, isSpot) {

    this.doc = this.startDoc.duplicate();
    
    var activeChannels = this.get_active_channels();
    this.doc.selection.deselect();

    var iaSwitch = new InteractSwitch();
    iaSwitch.set('none');
    
    if(isSpot) {
        if (this.doc.componentChannels.length < 1) {
            this.add_RGB_channels();
        }
    } else {
        if (this.doc.componentChannels.length > 0) {
            this.remove_component_channels();
        }
    }

    this.remove_alpha_channels(true);

    var teeChan = this.find_tee_channel();
    if(teeChan) teeChan.remove();

	/*spotchannels named like cmyk channels cause problems*/
    this.rename_cmyk();

	/*apply a little tint to whites to make them visible on white background*/
    this.recolor_white_spotchannels();

	/*make all chans visible for easy visual checking*/
    /*remove deactived channels*/

    for (var i = this.doc.channels.length-1; i >= 0; i--) {
        var chan = this.doc.channels[i];
    	if(activeChannels.includes(chan.name) || chan.kind === ChannelType.COMPONENT) {
            chan.visible = true;
        } else {
            chan.remove();
        }
    }

   /*check the chan histgrams to reveal channels that are not properly bitmapped or halftoned*/
    var histogramReports = this.get_histogram_reports();
    var isOk = this.show_histogramReport_dialog(histogramReports);

    //var dimensions = get_width_and_height (this.doc);

//~     if(!saveFile) {
//~         var tag = '_SD_Print';
//~         var saveFile = change_filename(this.doc.fullName, ['_SD_Working', tag], '.eps');
//~         saveFile = saveFile.saveDlg();
//~     }

    if(saveFile) {
        if(isSpot) {
            this.save_psd(saveFile);
        } else {
            this.save_dcs2(saveFile);
        }
    }
    iaSwitch.reset();
    return this.doc;
};