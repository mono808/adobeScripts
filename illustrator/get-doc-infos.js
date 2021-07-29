function main(filePath) {
    /*
                1                    +
    bounds:  0     2     values:  -     +
                3                    -    
    */
    var docFile = new File(filePath);
    var doc = app.open(docFile);
    /*
    var width = new UnitValue(doc.width, "pt");
    var height = new UnitValue(doc.height, "pt");
    */
    var width = doc.visibleBounds[2] - doc.visibleBounds[0];
    var height = Math.abs(doc.visibleBounds[3] - doc.visibleBounds[1]);
    width = new UnitValue(width, "pt");
    height = new UnitValue(height, "pt");

    var response = {};
    response.width = width.as("mm");
    response.height = height.as("mm");

    doc.close();

    return response;
}
