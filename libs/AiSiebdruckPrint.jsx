$.level = 1;

var AiSiebdruck = require('AiSiebdruck');
var MonoSpot = require('MonoSpot');
var saveOptions = require('saveOptions');

function AiSiebdruckPrint (initDoc) {
    AiSiebdruck.call(this, initDoc);

    this.pantoneTxt = new File($.getenv('pcroot') + '/adobescripts/pantones.txt');


}
AiSiebdruckPrint.prototype = Object.create(AiSiebdruck.prototype);
AiSiebdruckPrint.prototype.constructor = AiSiebdruckPrint;

AiSiebdruckPrint.prototype.check = function (items)
{
    //separationReport
    var suspItems = {
        nonSpotFills : [],
        nonSpotStrokes : [],
        spotStrokes : [],
    };

    if(this.pathItems.length < 1 && this.rasterItems.length < 1 && this.pageItems.length < 1) return false;

    if(this.pathItems.length > 0) {
        var i = this.pathItems.length-1;
        do {
            var pI = this.pathItems[i];
            // check fillcolor for spot / nonspot color
            switch(pI.fillColor.constructor.name) {
                case 'GrayColor' :
                case 'LabColor' :
                case 'RGBColor' :
                case 'CMYKColor' :
                case 'PatternColor' :
                    suspItems.nonSpotFills.push(pI);
                    if(pI.stroked && pI.strokeColor.constructor.name === 'SpotColor') {
                        suspItems.spotStrokes.push(pI);
                    }
                break;
                case 'SpotColor' :
                    // if pI has a stroke and is filled with sth. other than underbase spotcolor
                    // check the stroke too
                    if (pI.stroked &&
                        pI.strokeColor.constructor.name !== 'NoColor' &&
                        !this.ubRegEx.test(pI.fillColor.spot.name))
                    {
                        if(pI.strokeColor.constructor.name === 'SpotColor') {
                            suspItems.spotStrokes.push(pI);
                        } else {
                            suspItems.nonSpotStrokes.push(pI);
                        }
                    }
                break;
            }
        } while (i--);
    }

    if( suspItems.nonSpotFills.length > 0 ||
        suspItems.nonSpotStrokes.length > 0 ||
        suspItems.spotStrokes.length > 0 )
    {
        var cfStr = 'Separation enthält:\n\n';
        if(suspItems.nonSpotFills.length > 0)   cfStr += suspItems.nonSpotFills.length + ' PathItems with NONSPOT FILL\n';
        if(suspItems.nonSpotStrokes.length > 0) cfStr += suspItems.nonSpotStrokes.length + ' PathItems with NONSPOT STROKE\n';
        if(suspItems.spotStrokes.length > 0)    cfStr += suspItems.spotStrokes.length + ' PathItems with SPOT STROKES\n';
        cfStr += '\nContinue?';

        if(Window.confirm(cfStr)){
            return true;
        } else {
            return false;
        }
    }

    return true;
};

AiSiebdruckPrint.prototype.get_totalArea = function ()
{
    //               1                    +
    //   bounds:  0     2     values:  -     +
    //               3                    -

    var totalBounds = [];
    var initialized = false;

    for (var i = 0; i < this.spots.length; i++) {
        var spotChan = this.spots[i];
        if(!spotChan.isUB) {
            if(!initialized) {
                totalBounds = spotChan.bounds;
                initialized = true;
                continue;
            }

            var gB = spotChan.bounds;
            if(gB[0] < totalBounds[0]) totalBounds[0] = gB[0];
            if(gB[1] > totalBounds[1]) totalBounds[1] = gB[1];
            if(gB[2] > totalBounds[2]) totalBounds[2] = gB[2];
            if(gB[3] < totalBounds[3]) totalBounds[3] = gB[3];
        }
    }

    var totalArea = (totalBounds[2]-totalBounds[0]) * (totalBounds[1]-totalBounds[3]);
    this.totalBounds = totalBounds;
    this.totalArea = totalArea * this.sqpt2sqcm;
};

AiSiebdruckPrint.prototype.change_fillColor = function (itemsToCheck, oldSpot, newSpot)
{
    var tempColor = new SpotColor();
    tempColor.spot = newSpot;

    var i = itemsToCheck.length-1;
    var pI, tintValue, remainingItems = [];

    do {
        var pI = itemsToCheck[i];
        if (pI.fillColor.spot === oldSpot) {
            tintValue = pI.fillColor.tint
            pI.fillColor = tempColor;
            pI.fillColor.tint = tintValue;
        } else {
            remainingItems.push(pI);
        }
    } while(i--);

    return remainingItems;
};

AiSiebdruckPrint.prototype.create_colored_blob = function (spotColor)
{
    app.redraw();
    var tempColor = new SpotColor();

    try {
        var cP = this.doc.activeView.centerPoint;
        var zf = this.doc.activeView.zoom;
        var size = 500/zf;
    } catch (e) {
        var cP = [0,0];
        var zf = 1;
        var size = 500/zf;
        $.writeln('Illu PARMED, again... =/');
    }
    var blob = this.doc.pathItems.ellipse(cP[1]+size/2,  cP[0]-size/2,  size,  size);

    tempColor.spot = spotColor;
    blob.fillColor = tempColor;
    blob.stroked = false;
    return blob;
};

AiSiebdruckPrint.prototype.ask_user_for_new_colorname = function  (spotColor, txtName)
{
    var blob = this.create_colored_blob(spotColor);
    var presetStr = txtName ? txtName : 'Farbe X';
    app.redraw();
    var newName = String (Window.prompt ('Farbname für: ' + spotColor.name , presetStr, "mono's Pantone ReNamer"));
    blob.remove();
    return newName + ' ';
};

AiSiebdruckPrint.prototype.get_pantone_txt = function (panNr)
{
    var check = panNr.match(/\d{3,4}/);
    if(check.length > 0) {
        var nr = Number(check[0]);
        var read_file = this.pantoneTxt;

        read_file.open('r', undefined, undefined);
        read_file.encoding = "UTF-8";
        read_file.lineFeed = "Windows";

        if (read_file !== '') {
            var panStr = read_file.read();
            var splitStr = panStr.split('\n');
            var panArr = [];

            for(var i=0, maxI = splitStr.length; i < maxI; i+=1) {
                if(splitStr[i].indexOf('=') > -1) {
                    var aColorArr = splitStr[i].split('=');
                    panArr[aColorArr[0]] = aColorArr[1];
                }
            }

            read_file.close();
            return panArr[nr];
        }
    }
};

AiSiebdruckPrint.prototype.add_to_pantone_txt = function (pantoneStr)
{
    var append_file = this.pantoneTxt;
    var pS = pantoneStr;
    var color = pS.substring(0, pS.indexOf(' '));
    var nArr = pS.match(/\d{3,4}/);
    var nr = nArr[nArr.length-1];
    var appendStr = '\n';

    appendStr += nr;
    appendStr += '=';
    appendStr += color;

    var out;
    if (append_file !== '') {
        out = append_file.open('a', undefined, undefined);
        append_file.encoding = "UTF-8";
        append_file.lineFeed = "Windows";
    }

    if (out !== false) {
        if(append_file.write(appendStr)) {
            $.writeln(color + ' ' + nr + ' added to TXT');
            return true;
        } else {
            $.writeln('Could not add Pantone to TXT');
            return false;
        }
        append_file.close();
    }
};

AiSiebdruckPrint.prototype.rename_pantone_colors = function ()
{
    var panSpots = []; //spotcolors with default PANTONE name

    for (var i = 0, maxI = this.doc.spots.length; i < maxI; i+=1) {
        var spot = this.doc.spots[i];
        if(spot.name.indexOf('PANTONE') > -1) {
            spot.name = spot.name.replace('PANTONE ', '');
            panSpots.push(spot);
        }
    }

    var nrOnlyRE = /^\d{3,4}\s(C|U)$/i;
    // FIXME: if user enters '', no nonbreaking space character is needed

    for (var i = 0, maxI = panSpots.length; i < maxI; i+=1) {
        var panSpot = panSpots[i];
        var panNr = nrOnlyRE.exec(panSpot.name);

        // if stripped spotName contains only sth like 574 C, let user name the color
        if (panNr && panNr.length > 0) {
            var txtName = this.get_pantone_txt(panNr[0]);
            var userName = this.ask_user_for_new_colorname(panSpot, txtName);
            userName += panNr[0];
            if(!txtName) {
                this.add_to_pantone_txt(userName)
            };
            panSpot.name = userName;
        }
    }
};

AiSiebdruckPrint.prototype.make = function (saveFile, saveOptions) {
    this.sort_by_spotColor(this.pathItems);

    this.fit_artboard_to_art('Motiv');

    this.delete_layer('BG');
    
    if(this.pathItems.length > 0) this.rename_pantone_colors(this.pathItems);

    // delete fluff and save final separation for film output
    app.doScript('Delete Fluff', 'Separation');

    this.save_doc (saveFile, saveOptions, false);
}

module.exports = AiSiebdruckPrint;