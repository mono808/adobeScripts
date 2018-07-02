#target illustrator

#strict on
$.strict = true;
'use strict'

function main (report) 
{
    #include 'f_all.jsx'
    #include 'SepAI.jsx'
    #include 'Job.jsx'
    #include 'Pathmaker.jsx'
    #include 'save_Options.jsx'

    var job = new Job(null, true, false);
    var pm = new Pathmaker();

    //-------------------------------------------------------
    var sep = new SepAI(app.activeDocument);

    sep.fit_artboard_to_art('Motiv');

    //job.nfo.wxh = sep.get_wxh();

    sep.delete_layer('BG');

    sep.delete_layer('HilfsLayer');
    
    var saveFile = pm.file(job.nfo.tech.toLowerCase(), job.nfo);
    f_all.saveFile (saveFile, save_ops.ai_sep(), false);
}

main();