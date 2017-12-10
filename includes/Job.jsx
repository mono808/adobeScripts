#include '/c/capri-links/scripts/includes/rE.jsx'
#include '/c/capri-links/scripts/includes/LastFolders.jsxinc'

function Job (ref, fullExtract, nachdruckMoeglich) {
	this.nfo = {
		c2b : null,
		client : null,
		jobName : null,
		doc : null,
		file : null,
		folder : null,
		jobNr : null,
		refNr : null,
		printId : null,
		shop : null,
		tech : null,
		wxh : null,
	};

    this.lastFolders = new LastFolders();
    this.lastFolders.import_txt();
    this.get_nfo(ref, fullExtract, nachdruckMoeglich);
};

Job.prototype.get_nfo = function (ref, fullExtract, nachdruckMoeglich) {
    //try to get a reference to a job from the activeDocument
    if(!ref) {
        ref = this.get_ref();
    }
      
    //extract additional nfos from filename and folderstructure
    var tempNfo = null;

    switch(ref.constructor.name) {
        case 'Document' :
            if(!ref.saved) return null;
            ref = ref.fullName;        
        
        case 'File' :
            this.nfo.file = ref;
            tempNfo = this.get_nfo_from_filename(ref);
            this.add_to_nfo(tempNfo);
            ref = ref.parent;
        
        case 'Folder' :
            this.nfo.folder = ref;
            tempNfo = this.get_nfo_from_filepath(ref);
            this.add_to_nfo(tempNfo);
        break;
    }

    if(!this.nfo.jobNr && nachdruckMoeglich) {
        this.nfo.jobNr = this.get_jobNr_from_user();
    } else {
        this.nfo.jobNr = this.nfo.refNr;
    }

    // if full infos are needed and some are still missing,
    // let the user choose manually
    if(fullExtract && (!this.nfo.printId || !this.nfo.tech || !this.nfo.jobName)) {
        tempNfo = this.get_nfo_from_user();
        this.add_to_nfo(tempNfo);
    }            
    return this.nfo;
};

Job.prototype.get_ref = function () 
{
    // try to get a reference to a job from active documents or placed graphics
    var ref = null;
    var doc = null;
    try {doc = app.activeDocument} catch (e) {}

    if(doc) {
        switch (app.name) {
            case 'Adobe Illustrator' :
                ref = this.get_ref_from_ai_doc(doc);
            break;
            
            case 'Adobe InDesign' :                
                ref = this.get_ref_from_indd_doc(doc);
            break;

            case 'Adobe Photoshop' :
                ref = this.get_ref_from_ps_doc(doc);
            break;
        }
    }

    if(ref) {
        this.lastFolders.add(ref);
        return ref;
    } else {
        // if no reference is found, try the lastFolders
        // return this.jobSafe.get_set();
        return this.lastFolders.show_dialog();
    }
};

Job.prototype.get_ref_from_indd_doc = function (doc) 
{
    // if no docs are visible, dont try to get a ref 
    if(app.layoutWindows.length < 1) {return null}
    
    var ref = null;
  
    //close leftover docs without a layoutwindow
    var i, maxI, myDoc;      
    for(i = 0, maxI = app.documents.length; i < maxI; i += 1) {
        myDoc = app.documents[i];
        if(myDoc.windows.length < 1) {
            myDoc.close(SaveOptions.NO);
        }
    }
    
    if (doc.name.match(rE.print)) {
        ref = doc;
    } else if (doc.allGraphics.length > 0) {                    
        try {
            var checkThis = doc.layers.item('motivEbene');
            var checkthis = checkThis.name;
            ref = new File(checkThis.allGraphics[0].properties.itemLink.filePath);
        } catch (e) {
            ref = doc;
        }
    } else if (doc.saved && rE.printTag.test(doc.filePath.fullName)) {
        ref = doc;
    }

    return ref;
};

Job.prototype.get_ref_from_ps_doc = function (doc) 
{
    var ref = null;

    try {
        var check = doc.fullName;
        if ( rE.printTag.test(doc.name) || rE.jobNr.test(doc.path.fsName) ) {
            ref = doc;
        } else {
            ref = null;
        }
    } catch(e) {ref = null;}
    return ref;
};

Job.prototype.get_ref_from_ai_doc = function (doc) 
{
    var ref = null;

    //check if ref has a jobStyle FileName
    if (doc.name.match(rE.printTag) || doc.name.match(rE.printTag2)) {
        ref = doc;
    
    //if not, check if placedGraphic has a jobStyle FileName (only if its on Motiv-Layer)
    } else if (doc.placedItems.length > 0) {
        var i = null, pI = null;
        for(i=0; i < doc.placedItems.length; i++) {
            pI = doc.placedItems[i];
            if(pI.layer == doc.layers.getByName('Motiv')) {
                ref = doc.placedItems[0].file;
            }
        }
    
    //if not, check if the whole filepath contains a jobnumber
    } else if (rE.jobNr.test(doc.fullName)) {
        ref = doc;
    }

    return ref;
};

Job.prototype.get_nfo_from_filename = function (target) {
        var nfo = {};
                    
        if(target.constructor.name === 'File') {            
            nfo.file = target;
        }
    
        var fileName = target.displayName;
        var match;
            
        match = fileName.match(rE.printTag)
        if(match) {
            nfo.printId     = match[1];
            nfo.wxh         = match[2];
            nfo.tech        = match[3];
            return nfo;
        }

        match = fileName.match(rE.printTag2)
        if (match) {
            nfo.printId     = match[1];
            nfo.tech        = match[2];
            return nfo;
        }

        match = fileName.match(rE.doc)
        if (match) {
            nfo.jobNr       = match[1];
            nfo.jobName     = match[2];
            nfo.doc         = match[3];
            return nfo
        }
};

Job.prototype.get_nfo_from_filepath = function (fldr) {
    function check_folder_for_nfo(f, nfo) 
    {
        var fName = f.displayName,                
            jobMatch = fName.match(rE.jobNr);
        
        if (jobMatch) {
            var folderNewRegExp = new RegExp(/(\d{1,5}(wme|ang|cs|a)\d\d-0\d\d)_([a-z0-9äüöß-]+)/i);
            var folderOldRegExp = new RegExp(/(\d{1,5}(wme|ang|cs|a)\d\d-0\d\d)\s\(([a-z0-9äüöß-]+)\)/i);
            var match = fName.match(rE.jobNameNew);
            
            match = match ? match : fName.match(rE.jobNameOld);
            
            Folder.current = f;
            nfo.refNr  = jobMatch[0];
            nfo.folder = f;
            nfo.client = f.parent.displayName;
            nfo.c2b    = f.parent.parent.displayName;
            nfo.shop   = jobMatch[2] == 'wme' ? 'wme' : 'cs';
            
            if(!nfo.jobName && match) {
                nfo.jobName = match[3];
            }
        } else {
            if(f.parent != null) check_folder_for_nfo(f.parent, nfo);
        }
    }

    var nfo = {};
    switch (fldr.constructor.name) {
        case 'File' : fldr = fldr.parent;
        case 'Folder' : check_folder_for_nfo(fldr, nfo);
        break;
    }
    
    return nfo;
};

Job.prototype.get_nfo_from_user = function () {
    var mN = new MonoNamer();
    var result = {
        printId : this.nfo.printId || null,
        tech : this.nfo.tech || null,
        jobName: this.nfo.jobName || null,
    };

    var techs = mN.get_array('tech', true),
        ids = mN.get_array('printId', true),
        jobNames = this.get_jobNames(this.nfo.folder);

    var win = new Window('dialog', 'monos Print Id Dialog');
    win.orientation = 'column';
    win.alignChildren = 'fill';

    win.pgrp = win.add('group', undefined, '');
    win.pgrp.orientation = 'row';
    win.pgrp.alignChildren = 'top';
    
    win.okgrp = win.add('group', undefined, '');
    win.okgrp.orientation = 'row';
    win.okgrp.alignChildren = 'fill';


    var helper = function(b) {
        return function(e) {               
            if(this.value) {
                if(this.parent.text == 'Print_id') {
                    result.printId = f_all.validateString(this.parent.opts[b]);

                } else if (this.parent.text == 'Technique') {
                    result.tech = f_all.validateString(this.parent.opts[b]);

                } else if (this.parent.text == 'jobNames') {
                    result.jobName = f_all.validateString(this.parent.opts[b]);
                }
            }
        };
    };

    if(!result.printId)
    {
        ////////////////////////////////
        // add printId panel with radiobuttons and edittext           
        win.pgrp.idpnl = win.pgrp.add('panel', undefined, 'Print_id');
        var idpnl = win.pgrp.idpnl;
        idpnl.alignChildren = 'fill';
        idpnl.opts = ids;
 
        for (var i = 0, maxI = ids.length; i < maxI; i += 1) {
            idpnl['rad_'+i] = idpnl.add("radiobutton", undefined, mN.name('printId', ids[i]));

            if(result.printId == ids[i]) {idpnl['rad_'+i].value = true;}
            idpnl['rad_'+i].onClick = helper(i);
        };

        idpnl.newid = idpnl.add('edittext', undefined, 'Enter custom id:');
        idpnl.newid.onChange = function () {
            result.printId = this.text;
        }
    }

    if(!result.tech)
    {
        /////////////////////////////////7
        // add technique panel with radiobuttons           
        win.pgrp.techpnl = win.pgrp.add('panel', undefined, 'Technique');
        var techpnl = win.pgrp.techpnl;
        techpnl.alignChildren = 'fill';
        techpnl.opts = techs;

        for (var i = 0, maxI = techs.length; i < maxI; i += 1) {
            techpnl['rad_'+i] = techpnl.add("radiobutton", undefined, mN.name('tech', techs[i]));
            techpnl['rad_'+i].onClick = helper(i);
        };
    }

    if(!result.jobName)
    {
        /////////////////////////////////////
        // add jobName panel with radio buttons and edittext
        win.pgrp.jobNamepnl = win.pgrp.add('panel', undefined, 'jobNames');
        var jobNamepnl = win.pgrp.jobNamepnl;
        jobNamepnl.alignChildren = 'fill';
        jobNamepnl.opts = jobNames;
        
        for (var i = 0, maxI = jobNames.length; i < maxI; i += 1) {
            jobNamepnl['rad_'+i] = jobNamepnl.add("radiobutton", undefined, jobNames[i]);
            if(result.jobName == jobNames[i]) {jobNamepnl['rad_'+i].value = true;}
            jobNamepnl['rad_'+i].onClick = helper(i);
        };

        jobNamepnl.newjobName = jobNamepnl.add('edittext', undefined, 'New jobName:');
        jobNamepnl.newjobName.onChange = function () {
            result.jobName = this.text;
        }
    }

    /////////////////////////////////////
    // OK Cancel
    win.okgrp.yes = win.okgrp.add('button', undefined, 'Ok');
    win.okgrp.no =  win.okgrp.add('button', undefined, 'Abbrechen');

    var i,
        maxI,
        item;

    win.okgrp.yes.onClick = function () {

        if(result.printId && result.tech && result.jobName) {
            win.close();                
        } else {
        	var alertString = ('Diese Info(s) fehlen:\n');
        	alertString += !result.printId  ? 'Druckposition\n' : '';
        	alertString += !result.tech 	? 'Druckverfahren\n' : '';
        	alertString += !result.jobName 	? 'JobName\n' : '';
        	alertString += 'bitte auswählen!';
            alert(alertString);
            return;
        }
    };

    win.okgrp.no.onClick = function() {
        result = null;
        win.close();
    };

    win.show();
    //$.writeln(result.toSource());
    return result
};

Job.prototype.get_jobNames = function (jobfolder) {
    var jobfolders = jobfolder.parent.getFiles(rE.jobNr),
        jobNames = [],
        jobName;

    for (var i = 0, maxI = jobfolders.length; i < maxI; i += 1) 
    {
        var afolder = jobfolders[i];
        if(afolder instanceof Folder) {
            var fName = afolder.displayName;
            var match = fName.match(rE.jobNameNew);
            match = match ? match : fName.match(rE.jobNameOld);
            
            if (match && match.length > 3) {                    
                jobNames.push(match[3]);
            }
        }
    }
    return jobNames;
};

Job.prototype.get_jobNr_from_user = function () {

    var result = {
        jobNr : this.nfo.refNr || null,
    };

    var win = new Window('dialog', 'monos Print Id Dialog');
    win.orientation = 'column';
    win.alignChildren = 'fill';

    win.pgrp = win.add('group', undefined, '');
    win.pgrp.orientation = 'row';
    win.pgrp.alignChildren = 'top';
    
    win.okgrp = win.add('group', undefined, '');
    win.okgrp.orientation = 'row';
    win.okgrp.alignChildren = 'fill';

    /////////////////////////////////////
    // add jobNr panel with edittext
    win.pgrp.jobPnl = win.pgrp.add('panel', undefined, 'neue Auftragsnr erstellen?');
    win.pgrp.jobPnl.alignChildren = 'fill';        

    win.pgrp.jobPnl.refNr = win.pgrp.jobPnl.add('statictext', undefined, 'Auftragsnr. des aktuellen Verzeichnis: ' + this.nfo.refNr);
    win.pgrp.jobPnl.jobNr = win.pgrp.jobPnl.add('edittext', undefined, 'neue Auftragsnr. hier eingeben');
    win.pgrp.jobPnl.jobNr.onChange = function () {
        result.jobNr = this.text;
    }

    /////////////////////////////////////
    // OK Cancel
    win.okgrp.yes = win.okgrp.add('button', undefined, 'Ok');
    win.okgrp.no =  win.okgrp.add('button', undefined, 'Abbrechen');

    win.okgrp.yes.onClick = function () {

        if(win.pgrp.jobPnl.jobNr.text == 'neue Auftragsnr. hier eingeben') {
            //result.jobNr = this.nfo.refNr;
            win.close();
        } else if (rE.jobNr.test(win.pgrp.jobPnl.jobNr.text)) {
            result.jobNr = win.pgrp.jobPnl.jobNr.text;
            win.close();
        } else {
            var alertString = 'Auftragsnr. ';
            alertString += win.pgrp.jobPnl.jobNr.text;
            alertString += ' ist fehlerhaft. Bitte prüfen!';
            alert(alertString);
            return;
        }
    };

    win.okgrp.no.onClick = function() {
        result = null;
        win.close();
    };

    win.show();

    return result.jobNr;
};

Job.prototype.get_wxh = function () {
    var w = null,
        h = null,
        doc = app.activeDocument;

    switch (app.name) 
    {
        case 'Adobe Illustrator' :
            w = new UnitValue (doc.width, 'pt');
            h = new UnitValue (doc.height, 'pt');
            this.nfo.wxh = w.as('mm').toFixed(0) + 'x' + h.as('mm').toFixed(0);
        break;
        case 'Adobe Photoshop' :
            w = doc.width;
            h = doc.height;
            this.nfo.wxh = w.as('mm').toFixed(0) + 'x' + h.as('mm').toFixed(0);
        break;
    }
    return this.nfo.wxh;
};





Job.prototype.save_folder = function (input) {
    var fd;
    switch(input.constructor.name) {
        case 'File' : fd = input.parent;
        break;
        case 'Document' : fd = input.fullName.parent;
        break;
        case 'Folder' : fd = input;
    }

    $.writeln('update jobSafe & lastFolders to: ' + fd.displayName);        
    this.jobSafe.get_set(fd);
    this.lastFolders.add(fd);
}

Job.prototype.add_to_nfo = function (newNfo) {
	if(newNfo) {
        var p;
        for(p in this.nfo) {
            if(this.nfo.hasOwnProperty(p) && !this.nfo[p] && newNfo[p]) {
                this.nfo[p] = newNfo[p];
            }
        }
	}
};

Job.prototype.get_ref_from_active_doc_old = function () {
    var ref = null,
        doc = null;

    switch (app.name) {
        case 'Adobe Illustrator' :
            doc = app.documents.length > 0 ? app.activeDocument : null;
            if (doc) {
                //check if ref has a jobStyle FileName
                if (rE.printTag.test(doc.name)) {
                    ref = doc;
                
                //if not, check if placedGraphic has a jobStyle FileName (only if its on Motiv-Layer)
                } else if (doc.placedItems.length > 0) {
                    for(var i=0; i < doc.placedItems.length; i++) {
                        var pI = doc.placedItems[i];
                        if(pI.layer == doc.layers.getByName('Motiv')) {
                            ref = doc.placedItems[0].file;
                        }
                    }
                
                //if not, check if the whole filepath contains a jobnumber
                } else if (rE.jobNr.test(doc.fullName)) {
                    ref = doc;
                }
            }
        break;
        
        case 'Adobe InDesign' :
            if((app.documents.length > 0) && (app.layoutWindows.length > 0)) {
                doc = app.activeDocument;
            } else {
                doc = null;
            }
            
            //close docs without a window                   
            var i, maxI, myDoc;      
            for(i = 0, maxI = app.documents.length; i < maxI; i += 1) {
                myDoc = app.documents[i];
                if(myDoc.windows.length < 1) {
                    myDoc.close(SaveOptions.NO);
                }
            }
            
            if (doc) {
                if (rE.print.test(doc.name)) {
                    ref = doc;
                } else if (doc.allGraphics.length > 0) {                    
                    try {
                        var checkThis = doc.layers.item('motivEbene');
                        var checkthis = checkThis.name;
                        ref = new File(checkThis.allGraphics[0].properties.itemLink.filePath);
                    } catch (e) {
                        ref = doc;
                    }
                } else if (doc.saved && rE.printTag.test(doc.filePath.fullName)) {
                    ref = doc;
                }
            }
        break;

        case 'Adobe Photoshop' :
            doc = app.documents.length > 0 ? app.activeDocument : null;
            try {
                ref = doc;
                var check = ref.fullName;
                if ( rE.printTag.test(doc.name) || rE.jobNr.test(doc.path.fsName) ) {
                    ref = doc;
                } else {
                    ref = null;
                }
            } catch(e) {
                ref = null;
            }
        break;
    }

    //check adobe apps for open documents and try to get a reference file
    if(ref) {
        this.save_folder(ref);
        return ref;
    } else {   
        return this.jobSafe.get_set();
    }
};

