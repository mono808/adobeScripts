#target photoshop

function main() {
     
	#includepath '/c/capri-links/scripts/includes'        
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'Job.jsx'
    #include 'MonoNamer.jsx'
    #include 'save_Options.jsx'    

	var monoNamer = new MonoNamer();    
    var job = new Job(null, true, false);  

    f_all.saveFile(mofi.file('workingPs'), save_ops.backupPS(), false);    
};

if(app.activeDocument) {
    main();
}