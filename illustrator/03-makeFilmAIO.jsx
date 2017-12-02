#target illustrator
#script OpenTemplate
#strict on

function main (report) 
{
    #includepath '/c/capri-links/scripts/includes'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_ai.jsx'
    #include 'f_ai_sep.jsx'
    #include 'Job.jsx'
    #include 'MonoNamer.jsx'
    #include 'save_Options.jsx'

    var job = new Job(null, true, false);

    //-------------------------------------------------------

    var iDoc = app.activeDocument,
        sr = report;

    f_ai.fit_artboard_to_art('Motiv');

    job.get_wxh();

    f_ai.delete_layer('BG');
    var hasPIs = sr.items.length > 0;
    
    if(hasPIs) {f_ai_sep.rename_pantone_colors(sr.items);}

    try {
        var sepPos = f_ai_sep.get_sep_coordinates();
        //$.writeln('AI: Sep.x: ' + sepPos.x + ' | Sep.y: ' + sepPos.y);
    } catch(e) {
        alert('Konnte keine Position bestimmen, Separation bitte manuell in Indesign positioniern!');
        var sepPos = 'keinePositionsAngaben';
    }

    // save final separation for film output
    f_all.saveFile (mofi.file('sepAi'), save_ops.ai_sep(), false);
    f_all.send_sep_to_indesign(mofi.file('sepAi'), sepPos);

    // create a print preview for use in mockups (no spotcolors, no underbase)
    if(hasPIs && sr.ub_color) {
        sr.items = f_ai_sep.delete_underbase (sr.items, sr.ub_color);
    }
    
    f_ai.delete_layer('HilfsLayer');

    if(hasPIs) {f_ai_sep.change_spot_to_process_colors(sr.items);}

    f_all.saveFile (mofi.file('previewAi'), save_ops.ai_sep(), false);
    
    iDoc.close();

    f_ai.restart_illu();
}

function check () 
{
    
    #include '/c/capri-links/scripts/includes/f_ai.jsx'
    #include '/c/capri-links/scripts/includes/f_ai_sep.jsx'

    //separationReport
    var sR = {
        ok : false,
        ub_color : null,
        items : [],
        nonSpotFills : [],
        nonSpotStrokes : [],
        spotStrokes : [],
        rasterItems : []
    };

    sR.items = f_ai.get_all_pathItems_on_layer('Motiv');
    sR.rasterItems = f_ai.get_all_rasterItems_on_layer('Motiv');

    if(sR.items.length < 1 && sR.rasterItems.length < 1) { return false; }

    sR = f_ai_sep.check_sep_for_nonspot_items(sR, false);

    if( sR.nonSpotFills.length > 0 ||
        sR.nonSpotStrokes.length > 0 ||
        sR.spotStrokes.length > 0 ) 
    {
        var cfStr = 'Separation enthält:\n\n';
        cfStr += sR.nonSpotFills.length + ' PathItems with NONSPOT FILL\n';
        cfStr += sR.nonSpotStrokes.length + ' PathItems with NONSPOT STROKE\n';
        cfStr += sR.spotStrokes.length + ' PathItems with SPOT STROKES\n';
        cfStr += '\nContinue?';
        
        if(Window.confirm(cfStr)){
            return sR;
        } else {
            return false;
        }
    }    
    
    return sR;
}

var report = check();
if(report) {    
    main(report);
}