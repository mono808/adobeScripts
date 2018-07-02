#target photoshop

function main() {
           
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_ps.jsx'
    #include 'job_related.jsx'
    #include 'save_Options.jsx'
    
    job.set_nfo(null, true);

    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.MM;
       
    var sepPos = f_ps.trimAndGetPosition();

    job.nfo.wxh = job.extract.wxh();


    if(job.nfo.tech) {
        var ddTag = "dd" + job.nfo.tech;
        executeAction( charIDToTypeID( "save" ), undefined, DialogModes.ALL );
        // f_all.saveFile (mofi.file(job.nfo.tech.toLowerCase()), save_ops.backupPS(), false);
    } else {
        f_all.saveFile (mofi.file(job.nfo.tech.toLowerCase()), save_ops.backupPS(), false);
    }
    
    app.preferences.rulerUnits = originalRulerUnits; 
};

if(app.activeDocument) {
    main();
}