#include './InteractSwitch.jsx'
//#include 'BaseDoc.jsx'

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }
    
    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

if(typeof Object.prototype.create !== 'function') {
    Object.prototype.create = function(o) {
        var F = function () {}
        F.prototype = o;
        return new F();     
    };
}

function BaseDoc (initDoc) {
	this.doc = initDoc;
}

BaseDoc.prototype.save_doc = function (dest, saveOps, close, showDialog) {

    var saveFile = dest instanceof File ? dest : new File(dest);
    
    if (!saveFile.parent.exists) {
        var saveFolder = new Folder(saveFile.parent)
        saveFolder.create();
    };

    if(showDialog) saveFile = saveFile.saveDlg('Please check Filename');

    try {
        switch (app.name) {
            case 'Adobe Illustrator' :
                this.doc.saveAs(saveFile, saveOps);      
            break;
            case 'Adobe InDesign' :
                this.doc.save (saveFile);
            break;
            case 'Adobe Photoshop' :
                this.doc.saveAs(saveFile, saveOps);
            break;
        }
        if(close) this.doc.close();       
        return true;
    } catch(e) {
        alert(e);
        return false;
    }
};

BaseDoc.prototype.change_filename = function (sourceFile, addString, ext) {
    var oldName, newName = '';
    oldName = sourceFile.name;
    newName += oldName.substring(0,oldName.lastIndexOf('.'));

    if(addString && addString.constructor.name == 'Array') {
        newName = newName.replace(addString[0],addString[1]);
    } else {
        newName += addString;  
    }

    if(ext.indexOf('.') < 0) {
        newName += '.';    
    }    
    newName += ext;
    
    var newFile = new File(sourceFile.parent + '/' + newName);
    
    return newFile;
};

BaseDoc.prototype.get_saveFile = function (sourceFile, search, replace, extension) {
	var oldName = sourceFile.name;
	var oldExtension = oldName.substring(oldName.lastIndexOf('.')+1, oldName.length);
	var newName = oldName.substring(0,oldName.lastIndexOf('.'));
	var folder = sourceFile.parent;
	
	if(newName.search(search) != -1) {
		newName = newName.replace(search, replace);
	} else {
		newName += replace;
	}

	if(extension) {
		newName += '.';
		newName += extension;
	} else {
		newName += '.';
		newName += oldExtension;
	}
	var saveFile = new File(folder + '/' + newName);
	return saveFile;
};

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

BaseDoc.prototype.get_width_and_height = function () {

    var dimensions = {};
    dimensions.width = this.doc.width.as('mm');
    dimensions.height = this.doc.height.as('mm');
    dimensions.wxh = dimensions.width.toFixed(0) + 'x' + dimensions.height.toFixed(0);
    return dimensions;
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
        var visChan = this.doc.channels[i];
        if(visChan.visible) visChans.push(visChan);
    }
    
    //this.doc.activeChannels = this.doc.componentChannels;
    app.showColorPicker();
    var myColor = app.foregroundColor;
    var chan = this.doc.channels.add();
    chan.name = 'Tee';
    chan.kind = ChannelType.SPOTCOLOR;
    chan.color = myColor;
    chan.opacity = 100;
    
    if(this.doc.componentChannels.length < 1) {
        this.add_RGB_channels ();
    }

    this.move_channel_to_index(this.doc.componentChannels.length+1);

    this.doc.activeChannels = oldActiveChans; 
    for(var i = 0; i < visChans.length; i++) {
        visChans[i].visible = true;
    }
      
    app.foregroundColor = oldForegroundColor;
    return chan;
};

BaseDoc.prototype.delete_hidden_channels = function () {
    for (var i = this.doc.channels.length-1; i >= 0; i--) {
        if(!this.doc.channels[i].visible) {
            this.doc.channels[i].remove();
        }
    }
};

BaseDoc.prototype.get_active_channels = function () {
    var activeChannels = [];
    for (var i = 0; i < this.doc.channels.length; i++) {
        if(this.doc.channels[i].visible) {
            activeChannels.push(this.doc.channels[i].name);
        }
    }
    return activeChannels;
}

/*//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

SepDocPS

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////*/

function SepDocPS (initDoc, saveFile) {
	BaseDocPS.call(this, initDoc);
	this.doc = this.create_doc(saveFile ? saveFile : undefined);
}
SepDocPS.prototype = Object.create(BaseDocPS.prototype);
SepDocPS.prototype.constructor = SepDocPS;

SepDocPS.prototype.get_guide_location = function () {
    if(this.doc.guides.length > 0 && this.doc.guides.length < 3) {
        var defaultPos = {
        	x : new UnitValue(this.doc.width.value/2*-1, 'mm'),
        	y : new UnitValue(80, 'mm')
        };       
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

SepDocPS.prototype.recolor_white_spotchannels = function () {

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

SepDocPS.prototype.rename_cmyk = function () {
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

SepDocPS.prototype.save_dcs2 = function (saveFile) {
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

SepDocPS.prototype.get_histogram_reports = function () {
    
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

SepDocPS.prototype.show_histogramReport_dialog = function (reports) {
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

SepDocPS.prototype.get_raster_settings = function () {

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

SepDocPS.prototype.create_doc = function (saveFile) {
	var baseDoc = new BaseDocPS(this.doc);
    baseDoc.save_doc(baseDoc.doc.fullName);
    this.doc = this.doc.duplicate();
    this.doc.selection.deselect();

    var iaSwitch = new InteractSwitch();
    iaSwitch.set('none');   

    if (this.doc.componentChannels.length > 0) {
        this.remove_component_channels();
        this.remove_alpha_channels(true);
    	var teeChan = this.find_tee_channel();
		if(teeChan) teeChan.remove();
    };

	/*spotchannels named like cmyk channels cause problems*/
    this.rename_cmyk();

	/*apply a little tint to whites to make them visible on white background*/
    this.recolor_white_spotchannels();

	/*make all chans visible for easy visual checking*/
    for (var i = 0; i < this.doc.channels.length; i++) {
    	this.doc.channels[i].visible = true;
    }

   /*check the chan histgrams to reveal channels that are not properly bitmapped or halftoned*/ 
    var histogramReports = this.get_histogram_reports();
    var isOk = this.show_histogramReport_dialog(histogramReports);

    //var dimensions = get_width_and_height (this.doc);
    
    if(!saveFile) {
        var tag = '_SD_Print';
        var saveFile = change_filename(this.doc.fullName, ['_SD_Working', tag], '.eps');        
        saveFile = saveFile.saveDlg();
    }
    
    if(saveFile) this.save_dcs2(saveFile);
    
    iaSwitch.reset();
    return this.doc;
};




/*///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

PreviewDocPS

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////*/

function PreviewDocPS (initDoc, style, saveFile) {
	BaseDocPS.call(this, initDoc);
    this.saveOps = new PhotoshopSaveOptions ();
    with(this.saveOps) {
        alphaChannels = false;
        spotColors = false;
        layers = true;
        embedColorProfile = true;
    }
	switch(style) {
		case 'merged' : this.create_merged_doc (saveFile ? saveFile : undefined);
		break;
		case 'layered': this.create_layered_doc(saveFile ? saveFile : undefined);
		break;
		default :       this.create_layered_doc(saveFile ? saveFile : undefined);
	}
}
PreviewDocPS.prototype = Object.create(BaseDocPS.prototype);
PreviewDocPS.prototype.constructor = PreviewDocPS;

PreviewDocPS.prototype.create_layers_from_channels = function (chans) {
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
PreviewDocPS.prototype.create_merged_doc = function (saveFile) {
    this.baseDoc = new BaseDocPS(this.doc);
    var activeChannels = this.get_active_channels();

    this.doc = this.doc.duplicate();
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
    if(teeChan && teeChan.kind == ChannelType.SPOTCOLOR) {
        teeChan.kind = ChannelType.SELECTEDAREA;
    }

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

	/*if no saveFile is provided, use same name and folder as sourceDoc with new extension*/
    if(!saveFile) {    	
    	var search = '/_(Working|Print|Druck|Sep|Preview)/i';
    	var replace = '_Preview';
    	var saveFile = this.get_saveFile(this.baseDoc.doc.fullName, search, replace, 'psd');
        this.save_doc(saveFile, this.saveOps, false, true);
	} else if (saveFile instanceof File) {
        this.save_doc(saveFile, this.saveOps, false, false);
    }

    return this;
};

PreviewDocPS.prototype.create_layered_doc = function (saveFile) {

    this.baseDoc = new BaseDocPS(this.doc);
    this.doc = this.doc.duplicate();

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

    if(!saveFile) {    	
    	var search = '/_(Working|Print|Druck|Sep|Preview)/i';
    	var replace = '_Preview';
    	var saveFile = this.get_saveFile(this.baseDoc.doc.fullName, search, replace, 'psd');
        this.save_doc(saveFile, this.saveOps, false, true);
	} else if (saveFile instanceof File) {
        this.save_doc(saveFile, this.saveOps, false, false);
    }

	return this;
};