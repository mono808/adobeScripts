#target illustrator

#strict on
$.strict = true;
'use strict'

function main (report) 
{
    #include '/c/capri-links/scripts/includes/augment_objects.jsx'
    #include '/c/capri-links/scripts/includes/f_all.jsx'
    #include '/c/capri-links/scripts/includes/f_ai.jsx'
    #include '/c/capri-links/scripts/includes/f_ai_sep.jsx'
    #include '/c/capri-links/scripts/includes/job_related.jsx'
    #include '/c/capri-links/scripts/includes/save_Options.jsx'  

    job.set_nfo(null, true);

    //-------------------------------------------------------

    var iDoc = app.activeDocument,
        sr = report;

    f_ai.fit_artboard_to_art('Motiv');

    job.nfo.wxh = job.extract.wxh();

    f_ai.delete_layer('BG');

    f_ai.delete_layer('HilfsLayer');
    

    // switch (job.nfo.tech) {
    //     case 'FLX' : f_all.saveFile (mofi.file('flx'), save_ops.ai_sep(), false);
    //     break;
    //     case 'STK' : f_all.saveFile (mofi.file('stk'), save_ops.ai_sep(), false);
    //     break;
    // }    
    if(job.nfo.tech) {
        f_all.saveFile (mofi.file(job.nfo.tech.toLowerCase()), save_ops.ai_sep(), false);
    } else {
        f_all.saveFile (mofi.file(job.nfo.tech.toLowerCase()), save_ops.ai_sep(), false);
    }
}

function check () 
{ 
    #include '/c/capri-links/scripts/includes/f_ai.jsx'

    var artItems = f_ai.get_all_pathItems_on_layer('Motiv');

    if(!artItems) {
        alert('no paths filled with spotcolors found');
        return false;
    } else if (artItems.length > 0) {
        return true;
    }
}

if(check()) {
    main();
}