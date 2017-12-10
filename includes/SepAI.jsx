if(typeof Object.prototype.create !== 'function') {
    Object.prototype.create = function(o) {
        var F = function () {}
        F.prototype = o;
        return new F();     
    };
}

function BaseAI (doc) {
    this.doc = doc;
}

BaseAI.prototype.recursive_delete_layer = function (ly) 
{
    ly.locked = false;
    ly.visible = true;
    
    if(ly.layers.length > 0) {
        var i = ly.layers.length-1;
        do {
            var nestedLayer = ly.layers[i];
            this.recursive_delete_layer(nestedLayer);
        } while (i--);
    }

    if(ly.pageItems.length > 0) {         
        var j = ly.pageItems.length-1;
        do {
            var pI = ly.pageItems[j];
            pI.locked = false;
            pI.hidden = false;
            pI.remove();
        } while (j--);
    }
    ly.remove();
};

BaseAI.prototype.delete_layer = function (layer_name) 
{
    try {
        var l = this.doc.layers.getByName(layer_name);
        this.recursive_delete_layer(l);
    } catch (e) {
        $.writeln('no layer named ' + layer_name + ' found!');
        return;
    }
};

BaseAI.prototype.fit_artboard_to_art = function (artlayer_name) 
{
    var artLayer = this.doc.layers.getByName(artlayer_name);
    var selection = [];        

    var i = artLayer.pageItems.length-1;
    do {
        selection.push(artLayer.pageItems[i]);
    } while (i--);
    
    this.doc.selection = selection;
    this.doc.fitArtboardToSelectedArt(0);
};

BaseAI.prototype.get_items_on_layer = function (items, layer_name) 
{
    var itemsOnLayer = [];
    var l = this.doc.layers.getByName(layer_name);

    var item;
    var i = items.length-1;
    while (i >= 0) {
        item = items[i];
        if(item.layer == l) {itemsOnLayer.push(item)};
        i--;
    }

    return itemsOnLayer;
};

function SepAI (doc) {

    this.doc = doc;
    this.spots = [];
    this.pathItems = this.get_items_on_layer(this.doc.pathItems, 'Motiv');
    this.rasterItems = this.get_items_on_layer(this.doc.rasterItems, 'Motiv');
    this.ubRegEx = /^(UB|UL|Unterleger|Vordruck|UB-Grey)$/i;
    this.pantoneTxt = new File('/c/capri-links/Scripts2/pantones.txt');
    
    this.saveOpts = new IllustratorSaveOptions();
    with(this.saveOpts) {
        compatibility = Compatibility.ILLUSTRATOR16;
        embedICCProfile = true;
        pdfCompatible = true;
    }
    this.spots = [];
    this.sqpt2sqcm = new UnitValue(1,'pt').as('cm') * new UnitValue(1,'pt').as('cm');
}

SepAI.prototype = Object.create(BaseAI.prototype);

function MonoSpot (name) {
    this.name = name;
    this.spot;
    this.pathItems = [];
    this.bounds = [];
    this.area = 0;
    this.isUB = false;
    this.sqpt2sqcm = new UnitValue(1,'pt').as('cm') * new UnitValue(1,'pt').as('cm');
}

SepAI.prototype.check = function (items) 
{
    //separationReport
    var suspItems = { 
        nonSpotFills : [],
        nonSpotStrokes : [],
        spotStrokes : [],
    };

    if(this.pathItems.length < 1 && this.rasterItems.length < 1) return false;

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

SepAI.prototype.get_totalArea = function () 
{
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
/*
              1
bounds ->  0     2
              3
              +
values ->  -     +
              -
*/  
MonoSpot.prototype.add_pathItem = function (pI) {
    this.pathItems.push(pI);
    this.area += pI.area*this.sqpt2sqcm;
    var gB = pI.geometricBounds;
    if(gB[0] < this.bounds[0]) this.bounds[0] = gB[0];
    if(gB[1] > this.bounds[1]) this.bounds[1] = gB[1];
    if(gB[2] > this.bounds[2]) this.bounds[2] = gB[2];
    if(gB[3] < this.bounds[3]) this.bounds[3] = gB[3];
};

SepAI.prototype.sort_by_spotColor = function (pIs) 
{
    var i = pIs.length-1;
    var pI, monoSpot, fC, j;
    while(i >= 0) {
        pI = pIs[i];        
        monoSpot = null;

        if(!pI.filled)  {
            i--;
            continue;
        }

        fC = pI.fillColor;
        for (j = 0; j < this.spots.length; j++) {
            if(this.spots[j].spot.name == fC.spot.name) {
                monoSpot = this.spots[j];
                break;
            }
        }

        if(!monoSpot) {
            monoSpot = new MonoSpot(fC.spot.name);
            monoSpot.spot = fC.spot;
            monoSpot.bounds = pI.geometricBounds;
            
            if(this.ubRegEx.test(fC.spot.name)) monoSpot.isUB = true;
            
            this.spots.push(monoSpot);
        }

        monoSpot.add_pathItem(pI);
        i--;
    }
};

SepAI.prototype.delete_underbase2 = function () 
{
    var doc = this.doc;
    var removeFlag = false;
    for (var i = 0; i < this.spots.length; i++) {        
        if(this.ubRegEx.test(this.spots[i].spot.name)) {
            var ubSpot = this.spots.splice(i,1)[0];
            var j = ubSpot.pathItems.length-1;
            var pI;
            do {
                pI = ubSpot.pathItems.pop();
                pI.remove();
            } while (j--)
        }
    }
};

SepAI.prototype.get_sep_coordinates = function ()
{
    var doc = this.doc,
        abRect = doc.artboards[0].artboardRect,
        xRef = doc.pageItems.getByName('xLine').position[0],
        yRef = doc.pageItems.getByName('yLine').position[1],
        dist = {};
    
    dist.x = UnitValue((abRect[0] - xRef), 'pt');
    dist.y = UnitValue((yRef - abRect[1]), 'pt');
    return dist;
};

SepAI.prototype.change_fillColor = function (itemsToCheck, oldSpot, newSpot) 
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

SepAI.prototype.create_colored_blob = function (spotColor)
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

SepAI.prototype.ask_user_for_new_colorname = function  (spotColor, txtName) 
{
    var blob = this.create_colored_blob(spotColor);
    var presetStr = txtName ? txtName : 'Farbe X';
    app.redraw();
    var newName = String (Window.prompt ('Farbname für: ' + spotColor.name , presetStr, "mono's Pantone ReNamer"));
    blob.remove();
    return newName + ' ';
};

SepAI.prototype.get_pantone_txt = function (panNr) 
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

SepAI.prototype.add_to_pantone_txt = function (pantoneStr)
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

SepAI.prototype.rename_pantone_colors = function () 
{
    var panSpots = []; //spotcolors with default PANTONE name
    var pantoneRegEx = /PANTONE/;
    
    for (var i = 0, maxI = this.doc.spots.length; i < maxI; i+=1) {
        var spot = this.doc.spots[i];
        if(pantoneRegEx.test(spot.name)) { 
            spot.name = spot.name.replace('PANTONE ', '');
            panSpots.push(spot);
        }
    }

    var nrOnlyRE = /^\d{3,4}\s(C|U)$/i;

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

SepAI.prototype.get_wxh = function () {
    var doc = app.activeDocument;
    w = new UnitValue (doc.width, 'pt');
    h = new UnitValue (doc.height, 'pt');
    return w.as('mm').toFixed(0) + 'x' + h.as('mm').toFixed(0);
};

SepAI.prototype.get_swatch = function (mySpot) 
{
    for (var i = 0; i < this.doc.swatches.length; i++) {
        var swatch = this.doc.swatches[i];
        if(swatch.color.typename == 'SpotColor' && mySpot.name == swatch.color.spot.name) {
            return swatch;
        }
    }
};

SepAI.prototype.change_spot_to_process_colors2 = function () 
{
    for (var i = 0; i < this.spots.length; i++) {
        var monoSpot = this.spots[i];
        var mySwatch = this.get_swatch(monoSpot.spot);
        var oldColor = mySwatch.color.spot.color;
        switch(oldColor.constructor.name) 
        {
            case 'RGBColor' : 
                var newColor = new RGBColor();
                newColor.red = oldColor.red;
                newColor.green = oldColor.green;
                newColor.blue = oldColor.blue;
            break;
            case 'CMYKColor' :
                var newColor = new CMYKColor();
                newColor.cyan = oldColor.cyan;
                newColor.magenta = oldColor.magenta;
                newColor.yellow = oldColor.yellow;
                newColor.black = oldColor.black;
            break;
        }
        mySwatch.color = newColor;
        var j = monoSpot.pathItems.length-1;
        do {
            pathI = monoSpot.pathItems[j];
            pathI.fillColor = mySwatch.color;
        } while (j--);
    }
};

SepAI.prototype.areaCalc = 
{
    colorAreas : {},
    f : Number(0.352778*0.352778/100), //squarepoints to mm² to cm²

    add : function (pI) 
    {
        var validName = pI.fillColor.spot.name.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
            cAs = this.colorAreas;

        if(cAs.hasOwnProperty(validName)) {
            cAs[validName] -= pI.area;
        } else {
            cAs[validName] = 0;
            cAs[validName] -= pI.area;
        }
    },

    report_all : function() 
    {
        var cAs = this.colorAreas,
            cA,
            cmAs = {},
            i,                                            
            totalArea = 0;
        for(i in cAs) {
            if(cAs.propertyIsEnumerable(i)){                    
                cA = cAs[i];
                totalArea += cA;
                cA = Number((cA*this.f).toFixed(0));
                $.writeln('Color ' + i + ' has an area of: ' + cA + ' cm²');
                cAs[i] = cA;
            }
        }
        totalArea = Number((totalArea*this.f).toFixed(0));
        cAs['totalArea'] = totalArea;
        $.writeln('Total area is: ' + totalArea + ' cm²');
        return cAs;
    },

    get_area : function (color) 
    {
        var validName = pI.fillColor.spot.name.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
            cAs = this.colorAreas;
        if(cAs.propertyIsEnumerable(validName)) {
            cA = cAs[validName];
            cA = Number((cA*this.f).toFixed(0));
            $.writeln('Color ' + validName + ' has an area of: ' + cA + ' cm²');
            return cA;
        } else {
            $.writeln('Color ' + validName + ' not found, area: 0 cm²');
            return 0;
        }
    },

    get_total : function() 
    {
        var i, cA, totalArea = 0,
            cAs = this.colorAreas;
        for(i in cAs) {
            if(cAs.propertyIsEnumerable(i)) {
                cA = cAs[i]
                totalArea += cA;
            }
        }

        totalArea = Number((totalArea*factor).toFixed(0));
        $.writeln('Total coverage = ' + totalArea + ' cm²');
        return totalArea;
    },
};
