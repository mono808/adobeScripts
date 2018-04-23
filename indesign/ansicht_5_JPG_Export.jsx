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
    var saveFile = new File(myFolder + '/' + saveName + '.jpg');
    
    var docScale = myDoc.documentPreferences.pageWidth/ 297;
    var resolution = docScale > 4.5 ? 48 : 72;

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


    var layerToggle = f_id.layerToggle(['Intern', 'HL'])
    layerToggle.hide();
    
    myDoc.exportFile(ExportFormat.JPG, saveFile, false);

    layerToggle.show();
    
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
