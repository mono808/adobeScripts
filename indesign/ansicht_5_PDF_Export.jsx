#target indesign

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
    var saveFile = new File(myFolder + '/' + saveName + '.pdf');

    var docScale = myDoc.documentPreferences.pageWidth/ 297;
    var resolution = docScale > 4.5 ? 36 : 54;

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

    with(myExportPreset) {
        name = 'monosPDFExportPreset'
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
    
    // TODO: toggle for exporting neutral proofs (no shop & job info)

    var layerToggle = f_id.layerToggle(['Intern', 'HL'])
    layerToggle.hide();

    // when exporting fails, ask user for a new filename
    try {
        myDoc.exportFile(ExportFormat.pdfType, saveFile, false, myExportPreset);
        layerToggle.show();
    } catch(e) {
        alert(e+'\n\nBitte neuen Dateinamen wählen')
        var newSaveFile = saveFile.saveDlg();
        if(newSaveFile && newSaveFile.exists) {
            myDoc.exportFile(ExportFormat.pdfType, saveFile, false, myExportPreset);
            layerToggle.show();
        } else {
            alert('Save file canceled')
            layerToggle.show();
        }
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
