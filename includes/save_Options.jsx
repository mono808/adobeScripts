var save_ops = {

    previewPS : function () {
            var options = new PhotoshopSaveOptions ();
            options.alphaChannels = false;
            options.spotColors = false;
            options.layers = true;
            options.embedColorProfile = true;
            return options;
    },

    backupPS : function () {
            var options = new PhotoshopSaveOptions ();
            options.alphaChannels = true;
            options.spotColors = true;
            options.layers = true;
            options.embedColorProfile = true;
            return options;
    },

    sepPSPSD : function () {
            var options = new PhotoshopSaveOptions ();
            options.alphaChannels = true;
            options.spotColors = true;
            options.layers = true;
            options.embedColorProfile = true;
            return options;
    },

    sepPS : function () {
        var ops = new DCS2_SaveOptions();
        with(ops){
            dCS = DCSType.NOCOMPOSITE;
            embedColorProfile = false;
            encoding = SaveEncoding.ASCII;
            halftoneScreen = false;
            interpolation = false;
            multiFileDCS = false;
            preview = Preview.EIGHTBITTIFF;
            spotColors = true;
            transferFunction = false;
            vectorData = false;
        }
        return ops;
    },
            
    dtgPS : function () {
        var options = new TiffSaveOptions();
        with(options){
            alphaChannels = false;
            embedColorProfile = true;
            imageCompression = TIFFEncoding.TIFFLZW;
            layers = false;
            spotColors = true;
            transparency = true;
        }            
        return options;
    },

    // Illustrator

    ai_sep : function () {
        var options = new IllustratorSaveOptions();
        with(options) {
            compatibility = Compatibility.ILLUSTRATOR16;
            embedICCProfile = true;
            pdfCompatible = true;
        }            
        return options;
    },

    ai_dtg : function () {
        var options = new ImageCaptureOptions();
        with (options) {
            options.antiAliasing = false;
            options.transparency = true;
            options.resolution = 300;
            return options;
        }
    },

    ai_dtg_600 : function () {
        var options = new ImageCaptureOptions();
        with (options) {
            options.antiAliasing = false;
            options.transparency = true;
            options.resolution = 600;
            return options;
        }
    },

    ai_flx : function () {
        var options = new IllustratorSaveOptions();
        options.compatibility = Compatibility.ILLUSTRATOR16;
        options.embedICCProfile = true;
        options.pdfCompatible = true;
        return options;
    },

    ai_mockup_pdf : function () {
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

    ai_dta : function () {
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

    ai_pdf : function() {
        var options = new PDFSaveOptions();
        options.preserveEditability = true;
        return options;
    }
};
