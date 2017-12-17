#target photoshop-60.064

function save_dcs2(saveFile) {
    var idsave = charIDToTypeID( "save" );
        var desc2 = new ActionDescriptor();
        var idAs = charIDToTypeID( "As  " );
            var desc3 = new ActionDescriptor();
            var idPrvw = charIDToTypeID( "Prvw" );
            var idEPSP = charIDToTypeID( "EPSP" );
            var idTIFF = charIDToTypeID( "TIFF" );
            desc3.putEnumerated( idPrvw, idEPSP, idTIFF );
            var idDpth = charIDToTypeID( "Dpth" );
            var idDpth = charIDToTypeID( "Dpth" );
            var idEghB = charIDToTypeID( "EghB" );
            desc3.putEnumerated( idDpth, idDpth, idEghB );
            var idDCS = charIDToTypeID( "DCS " );
            var idDCS = charIDToTypeID( "DCS " );
            var idseventwoCS = charIDToTypeID( "72CS" );
            desc3.putEnumerated( idDCS, idDCS, idseventwoCS );
            var idEncd = charIDToTypeID( "Encd" );
            var idEncd = charIDToTypeID( "Encd" );
            var idASCI = charIDToTypeID( "ASCI" );
            desc3.putEnumerated( idEncd, idEncd, idASCI );
            var idHlfS = charIDToTypeID( "HlfS" );
            desc3.putBoolean( idHlfS, false );
            var idTrnF = charIDToTypeID( "TrnF" );
            desc3.putBoolean( idTrnF, false );
            var idClMg = charIDToTypeID( "ClMg" );
            desc3.putBoolean( idClMg, false );
            var idIntr = charIDToTypeID( "Intr" );
            desc3.putBoolean( idIntr, false );
        var idPhDtwo = charIDToTypeID( "PhD2" );
        desc2.putObject( idAs, idPhDtwo, desc3 );
        var idIn = charIDToTypeID( "In  " );
        desc2.putPath( idIn, saveFile );
        var idDocI = charIDToTypeID( "DocI" );
        desc2.putInteger( idDocI, 37 );
        var idsaveStage = stringIDToTypeID( "saveStage" );
        var idsaveStageType = stringIDToTypeID( "saveStageType" );
        var idsaveBegin = stringIDToTypeID( "saveBegin" );
        desc2.putEnumerated( idsaveStage, idsaveStageType, idsaveBegin );
    executeAction( idsave, desc2, DialogModes.NO );
}

function main() {
       
    #includepath '/c/repos/adobeScripts1/includes/'    
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'Job.jsx'
    #include 'MonoNamer.jsx'
    #include 'save_Options.jsx'
    #include 'f_ps.jsx'

    var job = new Job(null, true, false);
    var pm = new Pathmaker(job.nfo);

    //---------------------------------------------------------------------
    // create the separation file

    var workingDoc = app.activeDocument;
    var sepDoc = workingDoc.duplicate();

    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.MM;

    if (sepDoc.componentChannels.length > 0) {
        f_ps.remove_component_channels(sepDoc);
        f_ps.remove_alpha_channels(sepDoc);
    };
        
    var sepPos = f_ps.trimAndGetPosition();

    //job.nfo.wxh = job.get_wxh();

    f_ps.rename_cmyk();
    f_ps.recolor_white_spotchannels();

    //f_all.saveFile(pm.file('sepEps'), save_ops.sepPS(), false);
    var saveFile = pm.file('sepEps');
    if (!saveFile.parent.exists) {
        saveFolder = new Folder(saveFile.parent)
        saveFolder.create();
    };
    save_dcs2(pm.file('sepEps'));
    
    f_all.send_sep_to_indesign(sepDoc.fullName, sepPos);

    sepDoc.close();

    //---------------------------------------------------------------------
    // create the preview file

    var previewDoc = workingDoc.duplicate();

    if (previewDoc.componentChannels.length > 0) {
        previewDoc.changeMode(ChangeMode.RGB);
    } else {
        f_ps.addRGBChannels(previewDoc);
    }

    var previewType = f_all.choose_from_array(['Vollton','Raster'], undefined, 'Vollton oder Rasterseparation?');

    if(previewType == 'Vollton') {
        previewDoc.flatten();        
        f_ps.createLayersFromSpotChannels();
        previewDoc.artLayers.getByName('Ebene 0').remove();
        f_all.saveFile(pm.file('previewPs'), save_ops.previewPS(), false);
    } else {
        previewDoc.flatten();  
        f_ps.mergeSpotChannels();
        f_all.saveFile(pm.file('previewPs'), save_ops.previewPS(), false);
    }
    
    app.preferences.rulerUnits = originalRulerUnits;
}

function check () {

    if(!app.activeDocument) return false;

    #include '/c/capri-links/scripts/includes/f_ps.jsx'

    var pantoneChannels = f_ps.check_for_pantone();
    if( pantoneChannels.length > 0) {
        var alertStr = '';
        alertStr += 'Dokument enthält Pantone-Farben in folgenden Kanälen:\n\n';
        alertStr += pantoneChannels.join('\n');
        alertStr += '\n\nBitte erst in RGB Farben wandeln!';
        alert(alertStr);
        return false;
    }

    if(!f_ps.check_for_spot_channels()) {
        alert('Document contains no SpotColor Channels, script cancelled');
        return false;
    }

    return true;
}

if (check()) {
    main();
}
