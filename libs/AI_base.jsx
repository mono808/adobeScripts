$.level = 1;

function AI_base (doc) {
    this.doc = doc;
    this.saveOptions = {
        sep : function () {
            var options = new IllustratorSaveOptions();
            with(options) {
                compatibility = Compatibility.ILLUSTRATOR16;
                embedICCProfile = true;
                pdfCompatible = true;
            }            
            return options;
        },

        dtg : function () {
            var options = new ImageCaptureOptions();
            with (options) {
                options.antiAliasing = false;
                options.transparency = true;
                options.resolution = 300;
                return options;
            }
        },

        dtg_600 : function () {
            var options = new ImageCaptureOptions();
            with (options) {
                options.antiAliasing = false;
                options.transparency = true;
                options.resolution = 600;
                return options;
            }
        },

        flx : function () {
            var options = new IllustratorSaveOptions();
            options.compatibility = Compatibility.ILLUSTRATOR16;
            options.embedICCProfile = true;
            options.pdfCompatible = true;
            return options;
        },

        mockup_pdf : function () {
            var options = new PDFSaveOptions();
            options.pDFPreset = 'monosMockUpsSRGB';
            // options.colorProfileID = ColorProfile.None;
            // options.colorConversionID = ColorConversion.COLORCONVERSIONTODEST;
            // options.colorDestinationID = ColorDestination.COLORDESTINATIONPROFILE;
            // options.compatibility = PDFCompatibility.ACROBAT6;
            // options.compressArt = true;        
            // options.monochromeCompression = MonochromeCompression.None;
            // options.optimization = true;
            // options.preserveEditability = false;
            // options.pDFChangesAllowed = PDFChangesAllowedEnum.CHANGE128COMMENTING;
            return options;
        },

        dta : function () {
            var options = new PDFSaveOptions();
            options.compressArt = false;
            options.pDFPreset = 'DTA2.2';
            options.colorProfileID = ColorProfile.INCLUDEALLPROFILE;
            options.compatibility = PDFCompatibility.ACROBAT5;
            options.greyscaleCompression = CompressionQuality.ZIP8BIT;
            options.colorCompression = CompressionQuality.ZIP8BIT;
            options.monochromeCompression = MonochromeCompression.MONOZIP;
            return options;
        },

        pdf : function() {
            var options = new PDFSaveOptions();
            options.preserveEditability = true;
            return options;
        }
    }

}

AI_base.prototype.recursive_delete_layer = function (ly) {
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

AI_base.prototype.delete_layer = function (layer_name) {
    try {
        var l = this.doc.layers.getByName(layer_name);
        this.recursive_delete_layer(l);
    } catch (e) {
        $.writeln('no layer named ' + layer_name + ' found!');
        return;
    }
}

AI_base.prototype.fit_artboard_to_art = function (artlayer_name) {
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

AI_base.prototype.get_items_on_layer = function (items, layer_name) {
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

module.exports = AI_base;