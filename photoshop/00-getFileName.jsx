#target photoshop

function main() {
     
    #includepath '/c/repos/adobeScripts1/includes/'      
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'Job.jsx'
    #include 'MonoNamer.jsx'
    #include 'Pathmaker.jsx'
    #include 'save_Options.jsx'    

	var monoNamer = new MonoNamer();
    var job = new Job(null, true, false);
    var pm = new Pathmaker(job.nfo);

    f_all.saveFile(pm.file('workingPs'), save_ops.backupPS(), false);    
};

if(app.activeDocument) {
    main();
}