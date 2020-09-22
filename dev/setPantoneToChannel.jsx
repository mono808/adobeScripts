// Assign a pantone color and solidity (0.0-100.0) to the current channel
function setPantoneColor(pantoneName, solidity) {
    if(typeof solidity !== "undefined" && (solidity < 0.0 || solidity > 100.0)) {
        throw new Error("Solidity needs to be between 0.0 and 100.0, parameter value was " + solidity)
    }

    var idsetd = charIDToTypeID( "setd" );
    var desc1 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref = new ActionReference();
    var idChnl = charIDToTypeID( "Chnl" );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idTrgt = charIDToTypeID( "Trgt" );
    ref.putEnumerated( idChnl, idOrdn, idTrgt );
    desc1.putReference( idnull, ref );
    var idT = charIDToTypeID( "T   " );
    var desc2 = new ActionDescriptor();

    /* 
     set channel name - we don't want this

     var idNm = charIDToTypeID( "Nm  " );
     desc2.putString( idNm, pantoneName );
     */

    // color
    var idClr = charIDToTypeID( "Clr " );
    var desc3 = new ActionDescriptor();
    // set the color book to use
    var idBk = charIDToTypeID( "Bk  " );
    desc3.putString( idBk, """PANTONE+® Solid Coated""" );
    // set the color name
    var idNm = charIDToTypeID( "Nm  " );
    desc3.putString( idNm, pantoneName );

    /*
     haven't observed any difference when those were left out

     var idbookID = stringIDToTypeID( "bookID" );
     desc3.putInteger( idbookID, 3060 );
     */
    /*
     the code seems to be in ASCII and represent a non-standard pantone ID        

     var idbookKey = stringIDToTypeID( "bookKey" );
     desc3.putData( idbookKey, String.fromCharCode( 79, 82, 48, 50, 49, 67 ) );
     */
    // back color?
    var idBkCl = charIDToTypeID( "BkCl" );
    desc2.putObject( idClr, idBkCl, desc3 );

    if(typeof solidity !== "undefined") {
        // opacity (#prc = number of percent?)
        var idOpct = charIDToTypeID( "Opct" );
        var idPrc = charIDToTypeID( "#Prc" );  
        desc2.putUnitDouble( idOpct, idPrc, solidity);
    }

    // SCch - set color channel?
    var idSCch = charIDToTypeID( "SCch" );
    desc1.putObject( idT, idSCch, desc2 );
    executeAction( idsetd, desc1, DialogModes.NO );
}

// select a photoshop channel with the given name
function selectChannel(channelName) {
    var idslct = charIDToTypeID( "slct" );
    var desc = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref = new ActionReference();
    var idChnl = charIDToTypeID( "Chnl" );
    ref.putName( idChnl, channelName );
    desc.putReference( idnull, ref );
    executeAction( idslct, desc, DialogModes.NO );
 }

selectChannel("Name of the channel we want to set a pantone color for")
setPantoneColor("PANTONE Blue 072 C")
// alternatively, we can also set the solidity
//setPantoneColor("PANTONE Blue 072 C", 75.0)