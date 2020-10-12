//@target illustrator


function main (report) 
{

    //@include 'require.jsx'
    
    var f_all = require ('f_all'); //#include 'f_all.jsx'    
    var job = require('job');//#include 'Job.jsx'
    var paths = require('paths');//#include 'Pathmaker.jsx'
    var aiSep = require('AiSep');//#include 'SepAI.jsx'
    var areaDialog = require('AreaDialog')//#include 'AreaDialog.jsx'

    job.set_nfo(null, true, false);
    
    var sep = new aiSep(app.activeDocument);
    
    if(!sep.check()) return;
    
    var workingFile = paths.file('workingAi', job.nfo);
    f_all.saveFile (workingFile, sep.saveOpts, false);
    
    //sort pathItems by spotcolor, putting them into indivdual "spot arrays"
    sep.sort_by_spotColor(sep.pathItems);

    sep.fit_artboard_to_art('Motiv');
    //job.nfo.wxh = sep.get_wxh();

    sep.delete_layer('BG');
    
    if(sep.pathItems.length > 0) sep.rename_pantone_colors(sep.pathItems);

    // delete fluff and save final separation for film output
    app.doScript('Delete Fluff', 'Separation');

    var sepFile = paths.file('sepAi', job.nfo);    
    f_all.saveFile (sepFile, sep.saveOpts, false);
    
    var sepPos = sep.get_sep_coordinates();
    f_all.send_sep_to_indesign(sepFile, sepPos);

    sep.get_totalArea();
    //app.activeDocument.close();
    //var inkDialog = new AreaDialog(sep.spots, sep.totalArea).create_win().show();

    //app.open(previewFile);
    //create a print preview for use in mockups (no spotcolors, no underbase)
    sep.delete_underbase2();
    sep.delete_layer('HilfsLayer');

    if(sep.pathItems.length > 0) sep.change_spot_to_process_colors2();

    var previewFile = paths.file('previewAi');
    f_all.saveFile (previewFile, sep.saveOpts, false);
    
    //app.activeDocument.close();

    //restart_illu();
}

if(app.documents.length > 0) {
    main();
}