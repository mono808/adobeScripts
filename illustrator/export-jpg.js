(function () {
    var doc = app.activeDocument;
    var fsName = doc.fullName.fsName;
    var extension = fsName.substring(fsName.lastIndexOf ('.'), fsName.length);
    var exportFile = fsName.replace(extension, '.jpg');
    
    var lightGrey = new RGBColor();
    lightGrey.red = 200;
    lightGrey.green = 200;
    lightGrey.blue = 200;
    
    var jpgOpts = new ExportOptionsJPEG();
    jpgOpts.antiAliasing = true;
    jpgOpts.qualitySetting = 60;
    jpgOpts.artBoardClipping = true;
    jpgOpts.matte = false;
    jpgOpts.matteColor = lightGrey;
    jpgOpts.horizontalScale = 50;
    jpgOpts.verticalScale = 50;
    
    doc.exportFile(File(exportFile),ExportType.JPEG, jpgOpts);
    
})()