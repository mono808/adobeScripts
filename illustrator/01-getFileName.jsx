#target illustrator

function main() {
    
    #includepath '/c/capri-links/scripts/includes'
    #include 'f_all.jsx'
    #include 'Job.jsx'
    #include 'Pathmaker.jsx'
    #include 'MonoNamer.jsx'
    #include 'save_Options.jsx'
    
    var job = new Job(null, true, false);
    var pathmaker = new Pathmaker(job.nfo);
  
    f_all.saveFile (pathmaker.file('workingAi', job.nfo), save_ops.ai_sep(), false);
};

if (app.documents.length > 0) {
    main();
} else {
    alert('No open Document!');
}