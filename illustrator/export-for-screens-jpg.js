(function () {
    var doc = app.activeDocument;
    var exportFolder = doc.fullName;
    var exportFormat = ExportForScreensType.SE_JPEG80;
    var item = new ExportForScreensItemToExport();
    item.document = true;
    item.artboards = "";
    var prefix = "";
       
    var opts = new ExportForScreensOptionsJPEG();
    opts.antiAliasing = AntiAliasingMethod.TYPEOPTIMIZED;
    opts.compressionMethod = JPEGCompressionMethodType.PROGRESSIVE;
    opts.embedICCProfile = true;
    opts.scaleType = ExportForScreensScaleType.SCALEBYFACTOR;
    opts.scaleTypeValue = 0.5;
    
    doc.exportForScreens(exportFolder, exportFormat, opts, item, prefix);
    
})() 