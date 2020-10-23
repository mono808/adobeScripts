var AiBase = require('AiBase');
var MonoSpot = require('MonoSpot');

function AiSiebdruck (initDoc) {
    AiBase.call(this, initDoc);

    this.spots = [];
    this.pathItems = AiBase.prototype.get_items_on_layer.call(this, this.doc.pathItems, 'Motiv');
    this.rasterItems = AiBase.prototype.get_items_on_layer.call(this, this.doc.rasterItems, 'Motiv');
    this.pageItems = AiBase.prototype.get_items_on_layer.call(this, this.doc.pageItems, 'Motiv');
    this.ubRegEx = /^(UB|UL|Unterleger|Vordruck|UB-Grey)$/i;
    this.sqpt2sqcm = new UnitValue(1,'pt').as('cm') * new UnitValue(1,'pt').as('cm');
    
}
AiSiebdruck.prototype = Object.create(AiBase.prototype);
AiSiebdruck.prototype.constructor = AiSiebdruck;

AiSiebdruck.prototype.sort_by_spotColor = function (pIs)
{
    var i = pIs.length-1;
    while(i >= 0) {
        var pI = pIs[i];
        var monoSpot = null;

        if(!pI.filled)  {
            i--;
            continue;
        }

        var fC = pI.fillColor;
        var mySpot = null;
        
        switch (fC.constructor.name) {
            case 'SpotColor' : mySpot = fC.spot;
            break;

            case 'GradientColor' : mySpot = fC.gradient.gradientStops[0].color.spot;
            break;
        }
    
        if(mySpot == null) {
            i--;
            continue;
        }

        for (var j = 0; j < this.spots.length; j++) {
            if(this.spots[j].spot.name == mySpot.name) {
                monoSpot = this.spots[j];
                break;
            }
        }

        if(!monoSpot) {
            monoSpot = new MonoSpot(mySpot.name);
            monoSpot.spot = mySpot;
            monoSpot.bounds = pI.geometricBounds;

            if(mySpot.name.search(this.ubRegEx) > -1) monoSpot.isUB = true;

            this.spots.push(monoSpot);
        }

        monoSpot.add_pathItem(pI);
        i--;
    }
};

AiSiebdruck.prototype.get_sep_coordinates = function ()
{
    var doc = this.doc;
    var abRect = doc.artboards[0].artboardRect;
    
    try {
        var xRef = doc.pageItems.getByName('xLine').position[0];
    } catch(e) {
        var xRef = abRect[0]+(abRect[2]-abRect[0])/2;
    }
    try {
        var yRef = doc.pageItems.getByName('yLine').position[1];
    } catch(e) {
        var yRef = 300;
    }
    

    var dist = {};

    dist.x = UnitValue((abRect[0] - xRef), 'pt');
    dist.y = UnitValue((yRef - abRect[1]), 'pt');
    return dist;
};

AiSiebdruck.prototype.get_wxh = function ()
{
    var doc = app.activeDocument;
    var w = new UnitValue (doc.width, 'pt');
    var h = new UnitValue (doc.height, 'pt');
    return w.as('mm').toFixed(0) + 'x' + h.as('mm').toFixed(0);
};

//~ //@include 'require.jsx'
//~ var aiSd = new AiSiebdruck(app.activeDocument);
//~ alert(aiSd.get_wxh());

exports = module.exports = AiSiebdruck;