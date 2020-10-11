//@target illustrator
$.level=1

function main (report) 
{
    //@include 'require.jsx'

    var f_all = require('f_all');
    var AI_sep = require('AI_sep');
    var job = require('Job');
    var paths = require('paths');
    var saveOptions = require('saveOptions');

    job.set_nfo(null, true, false);

    //-------------------------------------------------------
    var sep = new AI_sep(app.activeDocument);

    sep.fit_artboard_to_art('Motiv');

    //job.nfo.wxh = sep.get_wxh();

    sep.delete_layer('BG');

    sep.delete_layer('HilfsLayer');
    
    // save print file
    var printFile = paths.file(job.nfo.tech.toLowerCase(), job.nfo);
    var saveOpts;
    switch (job.nfo.tech.toLowerCase()) {
        case 'flx' : saveOpts = saveOptions.ai_flx();
        break;
        case 'flo' : saveOpts = saveOptions.ai_flx();
        break;
        case 'dtax' : saveOpts = saveOptions.ai_dta();
        break;
        case 'dtao' : saveOpts = saveOptions.ai_dta();
        break;
        case 'stk' : saveOpts = saveOptions.ai_flx();
        break;   
    }

    f_all.saveFile (printFile, saveOpts, false);
    
    // save preview file
    var previewFile = pm.file('previewAi', job.nfo);
    f_all.saveFile (previewFile, save_ops.ai_flx(), false);

    app.open(printFile)
}

main();