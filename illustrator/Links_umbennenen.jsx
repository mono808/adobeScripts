//@target illustrator

function rename_linked_graphics (selection) {
    var placedItem, itemName;    
    for(var i = 0, maxI = selection.length; i < maxI; i++) {
        placedItem = selection[i];
        itemName = extract_layer_name (placedItem.file.displayName);
        placedItem.name = itemName;
    }
}

function extract_layer_name(fileName) {
    var itemNameRegEx = /^\d\d\d-(.*)(\.jpg)$/i;
    var match = fileName.match(itemNameRegEx);    
    if(match.length < 1) throw new Error('der Dateiname der platzierten JPG passt nicht zum vorgegebenen Schema');
    return match[1];
}

function get_svg_options () {
    var svgOpts = new ExportOptionsSVG();
    svgOpts.DTG = SVGDTDVersion.SVG1_1;
    svgOpts.cssProperties = SVGCSSPropertyLocation.STYLEATTRIBUTES;
    svgOpts.documentEncoding=SVGDocumentEncoding.UTF8;
    svgOpts.embedRasterImages=false;
    return svgOpts;
}

function get_output_file (startingPath) {
    var outFile = Folder(startingPath).saveDlg();
    return outFile;
}

function main() {
    var textilPath = "/c/monodev/einsatzheld/mediafiles/textilien";
    var doc = app.activeDocument;
    rename_linked_graphics (app.activeDocument.placedItems);
    var outputFile = get_output_file(textilPath);
    if(!outputFile) throw new Error('no output file defined');
    
    var svgOpts = get_svg_options ();
    
    app.activeDocument.exportFile(outputFile, ExportType.SVG, svgOpts);
};

main();