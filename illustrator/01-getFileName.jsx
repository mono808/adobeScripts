#target illustrator

function main() {
    
    #includepath '/c/capri-links/scripts/includes'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'Job.jsx'
    #include 'save_Options.jsx'
    #include 'MonoNamer.jsx'    
    
    var job = new Job(null, true, false);

    var iDoc = app.activeDocument,
        motivLayer = iDoc.layers.getByName('Motiv'),
        replace_sep = motivLayer.placedItems.length > 0,
        sepRef,
        refFile;
        
    if (replace_sep) {
        sepRef = iDoc.placedItems[0];
        refFile = iDoc.placedItems[0].file;
    } else {
        refFile = iDoc.fullName;
    }
    
    var fName = job.nfo.folder.displayName,
        sepPath,
        reReadInfos = false;

    var leadingDigits = fName.search(rE.digits_check);

    if(leadingDigits < 4)
    {
        reReadInfos = true;        
        switch(leadingDigits) {
            case 3 : fName = '0' + fName;
                break;
            case 2 : fName = '00' + fName;
                break;
            case 1 : fName = '000' + fName;
                break;
            case 0 : 
                alert('no jobNr found, Script canceled');
                return;
                break;
            default : fName = fName;
        }
    }

    if(fName.search(rE.jobNameNew) == -1) {
        fName += '_' + job.nfo.jobName;
        reReadInfos = true;
    }

    if(reReadInfos) 
    {
        if(replace_sep) {
            var sepPath = sepRef.file.absoluteURI.replace(job.nfo.folder.name, fName),
                sepPos = sepRef.position,
                sepWidth = sepRef.width,
                sepHeight = sepRef.height;
            sepRef.remove();
        }
        
        f_all.duplicateFolder(job.nfo.folder, job.nfo.folder.parent, fName, refFile);

        if(replace_sep) 
        {
            var newSep = iDoc.placedItems.add();
            newSep.file = new File(sepPath);
            newSep.width = sepWidth;
            newSep.height = sepHeight;
            newSep.position = sepPos;            
            var refDoc = newSep.file;
        }

        // refresh the nfo, so the new folder is used
        job.get_nfo(refDoc, false);
        //mofi.set_nfo(job);
    };

    f_all.saveFile (mofi.file('workingAi'), save_ops.ai_sep(), false);
};

if (app.documents.length > 0) {
    main();
} else {
    alert('No open Document!');
}