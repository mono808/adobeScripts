$.level = 1;

var AiSiebdruck = require('AiSiebdruck');
var MonoSpot = require('MonoSpot');

function AiSiebdruckPreview (initDoc) {
    AiSiebdruck.call(this, initDoc);
}
AiSiebdruckPreview.prototype = Object.create(AiSiebdruck.prototype);
AiSiebdruckPreview.prototype.constructor = AiSiebdruckPreview;

AiSiebdruckPreview.prototype.delete_underbase = function ()
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

AiSiebdruckPreview.prototype.get_swatch = function (mySpot)
{
    for (var i = 0; i < this.doc.swatches.length; i++) {
        var swatch = this.doc.swatches[i];
        if(swatch.color.typename == 'SpotColor' && mySpot.name == swatch.color.spot.name) {
            return swatch;
        }
    }
};

AiSiebdruckPreview.prototype.change_spot_to_process_colors = function ()
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

AiSiebdruckPreview.prototype.make = function (saveFile, saveOptions) {

    this.sort_by_spotColor(this.pathItems);

    this.fit_artboard_to_art('Motiv');

    this.delete_underbase();

    this.delete_layer('HilfsLayer');

    this.delete_layer('BG');

    if(this.pathItems.length > 0) this.change_spot_to_process_colors();

    app.doScript('Delete Fluff', 'Separation');

    this.save_doc (saveFile, saveOptions, false);
}

module.exports = AiSiebdruckPreview;