﻿//@target indesign
//@include "require.js"

function handlePresets(collection, pattern, modify) {
    var preset,
        i = collection.length;
    while (i--) {
        preset = collection[i];
        if (preset.name.indexOf(pattern) != -1) {
            modify(preset);
        }
    }
}

function setPdfExportPreferences(resolution) {
    var myFlattenerPresetName = "mockupFlattener";

    handlePresets(app.flattenerPresets, myFlattenerPresetName, function (preset) {
        preset.remove();
    });

    var flattenerPreset = app.flattenerPresets.add({
        name: myFlattenerPresetName
    });

    flattenerPreset.rasterVectorBalance = 0;
    flattenerPreset.lineArtAndTextResolution = 150;
    flattenerPreset.gradientAndMeshResolution = 150;
    flattenerPreset.convertAllTextToOutlines = false;
    flattenerPreset.convertAllStrokesToOutlines = false;
    flattenerPreset.clipComplexRegions = true;

    var myExportPresetName = "monosPDFExportPreset";
    handlePresets(app.pdfExportPresets, myExportPresetName, function (preset) {
        preset.remove();
    });

    // var exportPreset = app.pdfExportPresets.add({
    //     name: myExportPresetName
    // });

    var pEP = app.pdfExportPreferences;
    pEP.acrobatCompatibility = AcrobatCompatibility.ACROBAT_4;
    pEP.appliedFlattenerPreset = flattenerPreset;
    pEP.cropImagesToFrames = true;
    pEP.exportGuidesAndGrids = false;
    pEP.exportLayers = false;
    pEP.exportNonprintingObjects = false;
    pEP.generateThumbnails = true;
    pEP.includeICCProfiles = true;
    pEP.optimizePDF = false;
    // pEP.pdfColorSpace = PDFColorSpace.RGB;
    pEP.pdfColorSpace = PDFColorSpace.UNCHANGED_COLOR_SPACE;
    pEP.viewPDF = true;
    pEP.compressTextAndLineArt = false;
    pEP.colorBitmapCompression = BitmapCompression.JPEG;
    pEP.colorBitmapQuality = CompressionQuality.HIGH;
    pEP.colorBitmapSampling = Sampling.BICUBIC_DOWNSAMPLE;
    pEP.colorBitmapSamplingDPI = resolution;
    pEP.thresholdToCompressColor = resolution * 1.5;
    pEP.grayscaleBitmapCompression = BitmapCompression.JPEG;
    pEP.grayscaleBitmapQuality = CompressionQuality.HIGH;
    pEP.grayscaleBitmapSampling = Sampling.BICUBIC_DOWNSAMPLE;
    pEP.grayscaleBitmapSamplingDPI = resolution;
    pEP.thresholdToCompressGray = resolution * 1.5;
    pEP.monochromeBitmapCompression = MonoBitmapCompression.CCIT4;
    pEP.monochromeBitmapSampling = Sampling.BICUBIC_DOWNSAMPLE;
    pEP.monochromeBitmapSamplingDPI = resolution * 2;
    pEP.thresholdToCompressMonochrome = resolution * 3;
}

function setJpgExportPreferences(resolution) {
    var jpegEP = app.jpegExportPreferences;
    jpegEP.antiAlias = true; //	If true, use anti-aliasing for text and vectors during export.
    jpegEP.embedColorProfile = true;
    jpegEP.exportResolution = resolution; //range: 1 - 2400
    jpegEP.exportingSpread = true; //	If true, exports each spread as a single JPEG file. If false, exports facing pages as separate files and appends sequential numbers to each file name.
    jpegEP.jpegColorSpace = JpegColorSpaceEnum.RGB;
    jpegEP.jpegExportRange = ExportRangeOrAllPages.EXPORT_ALL; // ExportRangeOrAllPages.EXPORT_RANGE
    jpegEP.pageString = "1-3"; // The page(s) to export, specified as a page number or an array of page numbers. Note: Valid when JPEG export range is not all.
    jpegEP.jpegQuality = JPEGOptionsQuality.HIGH; // LOW MEDIUM HIGH MAXIMUM
    jpegEP.jpegRenderingStyle = JPEGOptionsFormat.BASELINE_ENCODING; // PROGRESSIVE_ENCODING
    jpegEP.simulateOverprint = false; //	If true, simulates the effects of overprinting spot and process colors in the same way they would occur when printing.
    jpegEP.useDocumentBleeds = false; //	If true, uses the document's bleed settings in the exported JPEG.
}

function main() {
    var job = require("job");
    var paths = require("paths");
    var f_id = require("f_id");

    //~     var jobNfo = job.get_jobNfo(app.activeDocument);
    //~     paths.set_nfo(jobNfo);

    var myDoc = app.activeDocument;
    var myFolder = myDoc.fullName.parent;
    var saveName = myDoc.name.substring(0, myDoc.name.lastIndexOf("."));
    var savePath = myFolder + "/" + saveName;
    var docScale = myDoc.documentPreferences.pageWidth / 297;
    var resolution = docScale > 4.5 ? 36 : 54;

    var exportStyleDialog = function () {
        var returnValue = {
            preset: null,
            neutral: null,
            saveFile: null
        };

        var win = new Window("dialog", "Neutral Ansicht erstellen?", undefined);
        this.windowRef = win;
        win.presetGroup = win.add("group", undefined, "presetGroup");
        win.presetGroup.pdfButton = win.presetGroup.add("button", [15, 15, 115, 45], "pdf");
        win.presetGroup.jpgButton = win.presetGroup.add("button", [130, 15, 230, 45], "jpg");
        win.styleGroup = win.add("group", undefined, "styleGroup");
        win.styleGroup.normalBtn = win.styleGroup.add("button", [15, 15, 115, 45], "Normal");
        win.styleGroup.neutralBtn = win.styleGroup.add("button", [130, 15, 230, 45], "NEUTRAL");
        // Register event listeners that define the button behavior
        win.presetGroup.pdfButton.onClick = function () {
            returnValue.exportFormat = ExportFormat.PDF_TYPE;
            returnValue.saveFile = new File(savePath + ".pdf");
            returnValue.setPreferences = setPdfExportPreferences;
            this.text = "-> PDF <-";
            this.parent.jpgButton.text = "jpg";
        };

        win.presetGroup.jpgButton.onClick = function () {
            returnValue.exportFormat = ExportFormat.JPG;
            returnValue.saveFile = new File(savePath + ".jpg");
            returnValue.setPreferences = setJpgExportPreferences;
            this.text = "-> JPG <-";
            this.parent.pdfButton.text = "pdf";
        };

        win.styleGroup.normalBtn.onClick = function () {
            returnValue.neutral = false;
            win.close();
        };
        win.styleGroup.neutralBtn.onClick = function () {
            returnValue.neutral = true;
            win.close();
        };

        // Display the window
        if (win.show() == 2) {
            return null;
        }

        return returnValue;
    };

    var exportStyle = exportStyleDialog();

    if (!exportStyle) return;

    //if (exportStyle.saveFile.exists)
    var layerToggle = f_id.layerToggle(["Intern", "HL"]);
    layerToggle.hide();

    if (exportStyle) {
        exportStyle.setPreferences(resolution);
        if (exportStyle.neutral) {
            var pageItemsToHide = ["csLogo", "wmeLogo", "jobFrame"];
            var pIToggle = f_id.smartPageItemsVisibilityToggle();
            pIToggle.set(pageItemsToHide, false);
        }
    }

    // when exporting fails, ask user for a new filename
    try {
        myDoc.exportFile(exportStyle.exportFormat, exportStyle.saveFile, false);
    } catch (e) {
        alert(e + "\n\nBitte neuen Dateinamen wählen");
        var newSaveFile = exportStyle.saveFile.saveDlg();
        if (newSaveFile) {
            myDoc.exportFile(exportStyle.exportFormat, newSaveFile, false);
        } else {
            alert("Save file canceled");
        }
    }

    layerToggle.show();

    if (exportStyle.neutral) {
        pIToggle.reset();
    }
}

function check() {
    if (app.documents.length > 0 && app.activeDocument) {
        return true;
    } else {
        return false;
    }
}

if (check()) {
    main();
}
