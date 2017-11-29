function getSepInfo() {

    var filmFile = new File ('film2Open');
    var indDoc = app.open(filmFile, false);
    // get placement and size Info in Points
    with (indDoc.viewPreferences) {
        var oldXUnits = horizontalMeasurementUnits;
        var oldYUnits = verticalMeasurementUnits;
        horizontalMeasurementUnits = MeasurementUnits.points;
        verticalMeasurementUnits = MeasurementUnits.points;
    };

    var pArea = indDoc.pages[0].pageItems.item( 'beutelArea' );
    var pBounds = pArea.geometricBounds;
    var sep = indDoc.pages[0].allGraphics[0];
    var sepBounds = sep.geometricBounds;
    
    var sepInfo = {};
    sepInfo.xDist = sepBounds[1] - pBounds[1];
    sepInfo.yDist = sepBounds[0] - pBounds[0];
    sepInfo.x2Dist = pBounds[3] - sepBounds[3];
    sepInfo.y2Dist = pBounds[2] - sepBounds[2];
    sepInfo.width = ( (sepBounds[3] - sepBounds[1])*0.0352777778 ).toFixed(1);
    sepInfo.height = sepBounds[2] - sepBounds[0];
    
    with (indDoc.viewPreferences) {
        try {
            horizontalMeasurementUnits = oldXUnits;
            verticalMeasurementUnits = oldYUnits;
        } catch(myError) {
            alert("Could not reset custom measurement units. Error: " + myError);
        };
    };

    // get spot Colors
    var spotArray = [];
    for (var i = 4; i < doc.colors.length; i++)  {
        var myColor = doc.colors[i];                
        if ((myColor.model === ColorModel.SPOT) && (myColor.name != 'Registration')) {
            spotArray.push(myColor.name);
        };
    };
    sepInfo.spots = spotArray;
    
    if (indDoc.modified == true) {
        indDoc.close(SaveOptions.no);
    } else {
        indDoc.close(SaveOptions.no);
    };
    
    return sepInfo.toSource();
    
};