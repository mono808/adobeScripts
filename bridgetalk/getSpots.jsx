function getSpots () {

    var filmFile = new File ('film2Open');
    var indDoc = app.open(filmFile);
    var spotArray = [];
    
    for (var i = 4, maxI = indDoc.swatches.length; i < maxI; i += 1)  {
        var myColor = indDoc.swatches[i];                
        if ((myColor.model == ColorModel.SPOT) && (myColor.name != 'Registration')) {
            spotArray.push(myColor.name);
        };
    };

    if (indDoc.modified == true) {
        indDoc.close(SaveOptions.no);
    } else {
        indDoc.close(SaveOptions.no);
    };

    return spotArray.toSource();    
};