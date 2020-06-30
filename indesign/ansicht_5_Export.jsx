function main () {

    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'Job.jsx'
    #include 'Pathmaker.jsx'
    #include 'save_Options.jsx'

    var job = new Job(null,false);
    var pm = new Pathmaker();
    var myDoc = app.activeDocument;
    var myFolder = myDoc.fullName.parent;
    var saveName = myDoc.name.substring(0, myDoc.name.lastIndexOf('.'));
    var savePath = myFolder + '/' + saveName;
    var docScale = myDoc.documentPreferences.pageWidth/ 297;
    var resolution = docScale > 4.5 ? 36 : 54;

    function setPdfExportPreferences() {
        var myFlattenerPresetName = "mockupFlattener";

        var myFlattenerPreset;
        try{
            myFlattenerPreset = app.flattenerPresets.itemByName(myFlattenerPresetName);
            var check = myFlattenerPreset.name;    
        } catch (e) {
            myFlattenerPreset = app.flattenerPresets.add({name:myFlattenerPresetName});
        }

        with(myFlattenerPreset) {
            rasterVectorBalance= FlattenerLevel.MEDIUM_LOW;
            lineArtAndTextResolution= resolution*2.5;
            gradientAndMeshResolution= resolution*2.5;
            convertAllTextToOutlines= false;
            convertAllStrokesToOutlines= false;
            clipComplexRegions= true;
        }

        try{
            var check = app.pdfExportPresets.itemByName('monosPDFExportPreset').name;
            app.pdfExportPresets.itemByName('monosPDFExportPreset').remove();
        } catch (e) {}
        finally {
            var myExportPreset = app.pdfExportPresets.add();
        } 

        with(app.pdfExportPreferences) {
            name = 'monosPDFExportPreset';
            acrobatCompatibility = AcrobatCompatibility.ACROBAT_4;
            appliedFlattenerPreset = myFlattenerPreset;
            cropImagesToFrames = true;
            exportGuidesAndGrids = false;
            exportLayers = false;
            exportNonprintingObjects = false;
            generateThumbnails = true;
            includeICCProfiles = true;
            optimizePDF = false;
            pdfColorSpace = PDFColorSpace.RGB;
            viewPDF = true;
            compressTextAndLineArt = false;

            colorBitmapCompression = BitmapCompression.JPEG;
            colorBitmapQuality = CompressionQuality.HIGH;
            colorBitmapSampling = Sampling.BICUBIC_DOWNSAMPLE;
            colorBitmapSamplingDPI = resolution;
            thresholdToCompressColor = resolution;

            grayscaleBitmapCompression = BitmapCompression.JPEG;
            grayscaleBitmapQuality = CompressionQuality.HIGH;
            grayscaleBitmapSampling = Sampling.BICUBIC_DOWNSAMPLE;
            grayscaleBitmapSamplingDPI = resolution;
            thresholdToCompressGray = resolution;

            monochromeBitmapCompression = MonoBitmapCompression.CCIT4;
            monochromeBitmapSampling = Sampling.BICUBIC_DOWNSAMPLE;
            monochromeBitmapSamplingDPI = resolution*2;
            thresholdToCompressMonochrome = resolution*2;    
        };
        //return myExportPreset;
    }

    function setJpgExportPreferences() {
        with(app.jpegExportPreferences) {
            antiAlias = true; //	If true, use anti-aliasing for text and vectors during export.
            embedColorProfile = true;
            exportResolution = resolution;	//range: 1 - 2400
            exportingSpread	= true; //	If true, exports each spread as a single JPEG file. If false, exports facing pages as separate files and appends sequential numbers to each file name.
            jpegColorSpace	= JpegColorSpaceEnum.RGB;
            jpegExportRange	= ExportRangeOrAllPages.EXPORT_ALL // ExportRangeOrAllPages.EXPORT_RANGE
            pageString	= '1-3'; // The page(s) to export, specified as a page number or an array of page numbers. Note: Valid when JPEG export range is not all.

            jpegQuality	= JPEGOptionsQuality.HIGH; // LOW MEDIUM HIGH MAXIMUM

            jpegRenderingStyle	= JPEGOptionsFormat.BASELINE_ENCODING // PROGRESSIVE_ENCODING

            simulateOverprint = false; //	If true, simulates the effects of overprinting spot and process colors in the same way they would occur when printing.
            useDocumentBleeds = false; //	If true, uses the document's bleed settings in the exported JPEG.
        }
        return 
    }

    var exportStyleDialog = function () {
        var returnValue = {
            preset: null,
            neutral: null,
            saveFile: null
        };

        var activeWindow = app.activeWindow;
        var width = activeWindow.bounds[3]-activeWindow.bounds[1];
        centerWidth = activeWindow.bounds[1] + width/2;
        var height = activeWindow.bounds[2]-activeWindow.bounds[0];
        centerHeight = activeWindow.bounds[0] + height/2;
        
        var dialogWidth = 225;
        var dialogHeight = 200;
        var dLeft = centerWidth-dialogWidth/2;
        var dRight = centerWidth+dialogWidth/2;
        var dTop = centerHeight-dialogHeight/2;
        var dBottom = centerHeight+dialogHeight/2;

        //var win = new Window("dialog", "Neutral Ansicht erstellen?",[dLeft,dTop,dRight,dBottom]);
        var win = new Window("dialog", "Neutral Ansicht erstellen?",undefined);
        this.windowRef = win;
        win.presetGroup = win.add("group",undefined,'presetGroup');
        win.presetGroup.pdfButton = win.presetGroup.add("button",undefined,"pdf");
        win.presetGroup.jpgButton = win.presetGroup.add("button", undefined, "jpg");
        win.styleGroup = win.add("group", undefined, "styleGroup");
        win.styleGroup.normalBtn = win.styleGroup.add("button", [15,15,105,185], "Normal");
        win.styleGroup.neutralBtn = win.styleGroup.add("button", [120, 15, 210, 185], "NEUTRAL");
        // Register event listeners that define the button behavior
        win.presetGroup.pdfButton.onClick = function () {
            returnValue.exportFormat = ExportFormat.PDF_TYPE;
            returnValue.saveFile = new File(savePath + '.pdf');
            returnValue.setPreferences = setPdfExportPreferences;
            this.text = '-> PDF <-';
            this.parent.jpgButton.text = 'jpg';
        }

        win.presetGroup.jpgButton.onClick = function () {
            returnValue.exportFormat = ExportFormat.JPG;
            returnValue.saveFile = new File(savePath + '.jpg');
            returnValue.setPreferences = setJpgExportPreferences;
            this.text = '-> JPG <-';
            this.parent.pdfButton.text = 'pdf';
        }
        
        win.styleGroup.normalBtn.onClick = function() {
            returnValue.neutral = false;
            win.close();
        };
        win.styleGroup.neutralBtn.onClick = function() {
            returnValue.neutral = true;
            win.close();
        };

        // Display the window
        win.show();
            
        return returnValue;
    }

    var exportStyle = exportStyleDialog();

    var layerToggle = f_id.layerToggle(['Intern', 'HL'])
    layerToggle.hide();
    
    if(exportStyle) {
        exportStyle.setPreferences();
        if(exportStyle.neutral) {
            var pageItemsToHide = ['csLogo', 'wmeLogo', 'jobFrame'];
            var pIToggle = f_id.smartPageItemsVisibilityToggle();
            pIToggle.set(pageItemsToHide, false);
        }
    }
    
    // when exporting fails, ask user for a new filename
    try {
        myDoc.exportFile(exportStyle.exportFormat, exportStyle.saveFile, false);
    } catch(e) {
        alert(e+'\n\nBitte neuen Dateinamen wählen')
        var newSaveFile = exportStyle.saveFile.saveDlg();
        if(newSaveFile) {
            myDoc.exportFile(exportStyle.exportFormat, newSaveFile, false);
        } else {
            alert('Save file canceled')
        }
    }
    
    layerToggle.show();
    
    if(exportStyle.neutral) {
        pIToggle.reset();
    }
}

function check() {
    if(app.documents.length > 0 && app.activeDocument) {
        return true;
    } else {
        return false;
    }
}

if(check()) {
    main();
}
