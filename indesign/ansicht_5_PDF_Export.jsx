#target indesign

function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'Job.jsx'
    #include 'Pathmaker.jsx'
    #include 'save_Options.jsx'

    //job.set_nfo(null, false);
    var pm = new Pathmaker();
    var myDoc = app.activeDocument;
    var myFolder = myDoc.fullName.parent;
    var saveName = myDoc.name.substring(0, myDoc.name.lastIndexOf('.'));
    var saveFile = new File(myFolder + '/' + saveName + '.pdf');

    var docScale = myDoc.documentPreferences.pageWidth/ 297;
    var resolution = docScale > 4.5 ? 48 : resolution;

    var myFlattenerPresetName = "mockupFlattener";

    var tempFlattenerPreset = app.flattenerPresets.itemByName(myFlattenerPresetName);
    if(tempFlattenerPreset != null){
        tempFlattenerPreset.remove();
    }

    var myFlattenerPreset = app.flattenerPresets.add(
    {
      name:myFlattenerPresetName,
      rasterVectorBalance: 0,
      lineArtAndTextResolution: resolution,
      gradientAndMeshResolution: resolution,
      convertAllTextToOutlines: true,
      convertAllStrokesToOutlines: true,
      clipComplexRegions: true
    });

    with(app.pdfExportPreferences) {
        acrobatCompatibility = AcrobatCompatibility.ACROBAT_4;
        appliedFlattenerPreset = myFlattenerPreset;
        cropImagesToFrames = true;
        exportGuidesAndGrids = false;
        exportLayers = false;
        exportNonprintingObjects = false;
        generateThumbnails = true;
        includeICCProfiles = true;
        optimizePDF = true;
        pdfColorSpace = PDFColorSpace.RGB;
        viewPDF = true;

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
    }

    try{myDoc.layers.item('Intern').visible = false;} catch(e){}
    myDoc.exportFile(ExportFormat.pdfType, saveFile, false);

    try{myDoc.layers.item('Intern').visible = true;} catch(e){}
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
