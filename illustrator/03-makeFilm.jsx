#target illustrator
#script MakeFilmAI

function main (report) 
{

    #includepath '/c/repos/adobeScripts1/includes'
    #include 'f_all.jsx'
    #include 'Job.jsx'
    #include 'Pathmaker.jsx'
    #include 'SepAI.jsx'
    #include 'AreaDialog2.jsx'

    var job = new Job(null, true, false);
    
    var pm = new Pathmaker();
    
    var sep = new SepAI(app.activeDocument);
    
    if(!sep.check()) return;
    
    //sort pathItems by spotcolor, putting them into indivdual "spot arrays"
    sep.sort_by_spotColor(sep.pathItems);

    sep.fit_artboard_to_art('Motiv');
    //job.nfo.wxh = sep.get_wxh();

    sep.delete_layer('BG');
    
    if(sep.pathItems.length > 0) sep.rename_pantone_colors(sep.pathItems);

    // save final separation for film output
    var sepFile = pm.file('sepAi', job.nfo);
    f_all.saveFile (sepFile, sep.saveOpts, false);
    
    var sepPos = sep.get_sep_coordinates();
    f_all.send_sep_to_indesign(sepFile, sepPos);

    sep.get_totalArea();
    var inkDialog = new AreaDialog(sep.spots, sep.totalArea).create_win().show();

    //create a print preview for use in mockups (no spotcolors, no underbase)
    sep.delete_underbase2();
    sep.delete_layer('HilfsLayer');

    if(sep.pathItems.length > 0) sep.change_spot_to_process_colors2();

    var previewFile = pm.file('previewAi');
    f_all.saveFile (previewFile, sep.saveOpts, false);
    
    //app.activeDocument.close();

    //restart_illu();
}

if(app.documents.length > 0) {
    main();
}