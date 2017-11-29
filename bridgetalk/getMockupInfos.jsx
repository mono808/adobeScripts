function getMockUpInfos () {

    mockRef = new File('file2Open');

    iDoc = app.open(mockRef);

    var retval = {};

    try {
        var textil = iDoc.textFrames.getByName('textil').contents;
        if (textil != '') {
            $.writeln(textil);
            retval.textil = textil;
        } else {
            retval.textil = ' ';
        };
        
    } catch (e) { retval.texil = ' '};

    try {
        var textilColors = iDoc.textFrames.getByName('textilColors').contents;
        if (textilColors != '') {
            $.writeln(textilColors);
            retval.textilColors = textilColors;
        } else {
            retval.textilColors = ' ';
        };
        
    } catch (e) { retval.texilColors = ' '};

    try {
        var standFront = iDoc.textFrames.getByName('standFront').contents;
        if (standFront != '') {
            $.writeln(standFront);
            retval.stand1 = standFront;
        } else {
            retval.stand1 = ' ';
        };
        
    } catch (e) { retval.stand1 = ' '};

    try {
        var standBack = iDoc.textFrames.getByName('standBack').contents; 
        if (standBack != '') {
            $.writeln(standBack);
            retval.stand2 =  standBack;
        } else {
            retval.stand2 = ' ';
        };
        
    } catch (e) { retval.stand2 = ' '};

    iDoc.close();

    return retval.toSource();
};