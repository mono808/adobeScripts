var Base = require('BaseDoc');

function AiBase (initDoc) {
    Base.call(this, initDoc);
}

AiBase.prototype = Object.create(Base.prototype);
AiBase.prototype.constructor = AiBase;

AiBase.prototype.recursive_delete_layer = function (ly) {
    ly.locked = false;
    ly.visible = true;

    if (ly.layers.length > 0) {
        var i = ly.layers.length - 1;
        do {
            var nestedLayer = ly.layers[i];
            this.recursive_delete_layer(nestedLayer);
        } while (i--);
    }

    if (ly.pageItems.length > 0) {
        var j = ly.pageItems.length - 1;
        do {
            var pI = ly.pageItems[j];
            pI.locked = false;
            pI.hidden = false;
            pI.remove();
        } while (j--);
    }
    ly.remove();
}

AiBase.prototype.delete_layer = function (layer_name) {
    try {
        var l = this.doc.layers.getByName(layer_name);
        this.recursive_delete_layer(l);
    } catch (e) {
        $.writeln('no layer named ' + layer_name + ' found!');
        return;
    }
}

AiBase.prototype.fit_artboard_to_art = function (artlayer_name) {
    try {
        var artLayer = this.doc.layers.getByName(artlayer_name)
    } catch (e) {
        artLayer = this.doc.activeLayer
    }

    var selection = [];

    var pI;
    var i = artLayer.pageItems.length - 1;
    do {
        pI = artLayer.pageItems[i];
        if (pI.hidden || pI.locked) {
            continue;
        }

        selection.push(artLayer.pageItems[i]);
    } while (i--);

    this.doc.selection = selection;
    this.doc.fitArtboardToSelectedArt(0);
}

AiBase.fit_artboard_to_selection = function (myDoc, arrayOfPageItems, padding) 
    {
        var i = arrayOfPageItems.length-1;
        var vB;
        var selBounds = arrayOfPageItems[i].visibleBounds; //use first pageItem to init the Bounds
        
        do {
            vB = arrayOfPageItems[i].visibleBounds; /*bounds = [left,top,right,bottom]*/
            selBounds[0] = vB[0] < selBounds[0] ? vB[0] : selBounds[0];
            selBounds[1] = vB[1] > selBounds[1] ? vB[1] : selBounds[1];
            selBounds[2] = vB[2] > selBounds[2] ? vB[2] : selBounds[2];
            selBounds[3] = vB[3] < selBounds[3] ? vB[3] : selBounds[3];
        } while (i--);

        var myBorder = padding;
        var myBorderInput = -1;
        while (myBorder < 0 || myBorder > 100 || isNaN(myBorder) ) {
            myBorderInput = prompt("Size of padding around image, in points (0-100)","20","Padding Size");
            myBorder = parseInt(myBorderInput);
        }

        selBounds[0] -= myBorder;
        selBounds[1] += myBorder;
        selBounds[2] += myBorder;
        selBounds[3] -= myBorder;

        var ab = myDoc.artboards.getActiveArtboardIndex();  
        myDoc.artboards[ab].artboardRect = selBounds;

        return myDoc;
    }

AiBase.prototype.get_items_on_layer = function (items, layer_name) {
    var itemsOnLayer = [];
    try {
        var l = this.doc.layers.getByName(layer_name);
    } catch (e) {
        return itemsOnLayer;
    }

    var item;
    var i = items.length - 1;
    while (i >= 0) {
        item = items[i];
        if (item.layer == l) {
            itemsOnLayer.push(item)
        };
        i--;
    }

    return itemsOnLayer;
}

module.exports = AiBase;