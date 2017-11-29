var job = {
    
    nfo : {},
    //extracts job related infos from filename and folder structure
    extract : 
    {
        from_filename : function (target) 
        {
            // var xtr;
            // this.extracted ? xtr = this.extracted : xtr = this.extracted = {};            

            var nfo = {};
                        
            if(target.constructor.name === 'File') {            
                nfo.file = target;
            }
        
            var dN = target.displayName,
                tag = null,
                splitArray = null;
                
            if(rE.printTag.test(dN)) 
            {
                tag             = rE.printTag.exec(dN)[0];
                splitArray      = tag.split('_');
                nfo.printId     = splitArray[0];
                nfo.wxh         = splitArray[1];
                //nfo.tech        = splitArray[2].substring(0, splitArray[2].lastIndexOf('.'));
                nfo.tech        = splitArray[2];
            } else if (rE.doc.test(dN))
            {
                tag             = rE.doc.exec(dN)[0];
                splitArray      = tag.split('_');
                nfo.jobNr       = splitArray[0];
                nfo.design      = splitArray[1];
                nfo.doc         = splitArray[2];
            }
            return nfo;
        },

        from_filepath : function (fldr) 
        {
            function check_folder_for_nfo(f, nfo) 
            {
                var fName = f.displayName,                
                    jobNr = rE.jobNr.exec(fName),
                    designNew = rE.job_design.exec(fName),
                    designOld = rE.jobDesignOld.exec(fName);
                
                if(jobNr) {
                    Folder.current = f;
                    nfo.jobNr  = jobNr[0];
                    nfo.folder = f;
                    nfo.client = f.parent.displayName;
                    nfo.c2b    = f.parent.parent.displayName;
                    /WME24/.test(jobNr) ? nfo.shop = 'wme' : nfo.shop = 'cs';
                    if(!nfo.design) {
                        if(designNew) {
                            nfo.design = fName.substring(fName.indexOf("_")+1, fName.length);
                        } else if (designOld) {
                            nfo.design = fName.substring(fName.indexOf(" (")+2, fName.length-1);
                        }
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
        },

        get_designs : function (jobfolder) 
        {
            var jobfolders = jobfolder.parent.getFiles(rE.jobNr),
                designs = [],
                i,
                maxI,
                afolder,
                fName,
                result,
                design;

            for (i = 0, maxI = jobfolders.length; i < maxI; i += 1) 
            {
                afolder = jobfolders[i];
                if(afolder instanceof Folder)
                {
                    fName = afolder.displayName;
                    result = rE.job_design.exec(fName);
                    if (result) 
                    {                    
                        design = fName.substring(fName.indexOf("_")+1, fName.length);
                        designs.push(design);
                    }
                }
            }
            return designs
        },

        wxh : function ()
        {
            var wxh = null,
                w = null,
                h = null,
                doc = app.activeDocument;

            switch (app.name) 
            {
                case 'Adobe Illustrator' :
                    w = new UnitValue (doc.width, 'pt');
                    h = new UnitValue (doc.height, 'pt');
                    wxh = w.as('mm').toFixed(0) + 'x' + h.as('mm').toFixed(0);
                break;
                case 'Adobe Photoshop' :
                    w = doc.width;
                    h = doc.height;
                    wxh = w.as('mm').toFixed(0) + 'x' + h.as('mm').toFixed(0);
                break;
            }
            return wxh;
        },

        from_user : function (knownNfo) 
        {
            var mN = monoNamer;            
            var nfo = knownNfo ? knownNfo : {};
            var result = {
                printId : nfo.printId || null,
                tech : nfo.tech || null,
                design: nfo.design || null
            };

            var techs = mN.get_array('tech', true),
                ids = mN.get_array('printId', true),
                designs = this.get_designs(nfo.folder);

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

                        } else if (this.parent.text == 'Designs') {
                            result.design = f_all.validateString(this.parent.opts[b]);
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

            if(!result.design)
            {
                /////////////////////////////////////
                // add design panel with radio buttons and edittext
                win.pgrp.designpnl = win.pgrp.add('panel', undefined, 'Designs');
                var designpnl = win.pgrp.designpnl;
                designpnl.alignChildren = 'fill';
                designpnl.opts = designs;
                
                for (var i = 0, maxI = designs.length; i < maxI; i += 1) {
                    designpnl['rad_'+i] = designpnl.add("radiobutton", undefined, designs[i]);
                    if(result.design == designs[i]) {designpnl['rad_'+i].value = true;}
                    designpnl['rad_'+i].onClick = helper(i);
                };

                designpnl.newdesign = designpnl.add('edittext', undefined, 'New Design:');
                designpnl.newdesign.onChange = function () {
                    result.design = this.text;
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

                if(result.printId && result.tech && result.design) {
                    win.close();                
                } else {
                    alert(result.toSource());
                    return;
                }
            };

            win.okgrp.no.onClick = function() {
                result = null;
                win.close();
            };

            win.show();
            $.writeln(result.toSource());
            return result
        },

        all : function (target, full_nfo) 
        {
            var nfo = {},
                tempNfo = null,
                extract = this;

            switch(target.constructor.name) {
                case 'Document' : 
                    target = target.fullName;
                case 'File' : 
                    tempNfo = extract.from_filename(target);
                    f_all.copyProps(tempNfo, nfo);
                    target = target.parent;
                case 'Folder' :
                    tempNfo = extract.from_filepath(target);
                    f_all.copyProps(tempNfo, nfo);
                break;
            }

            // if full infos are needed and some are still missing,
            // let the user choose manually
            if(full_nfo && (!nfo.printId || !nfo.tech || !nfo.design)) 
            {
                tempNfo = extract.from_user(nfo);
                f_all.copyProps(tempNfo, nfo);
            }            
            return nfo;
        }
    },

    // safes the last used jobfolder to estk via bridgetalk.
    // other apps can used this referenced folder when
    // get_ref gets no ref from currently open docs or placed graphics
    job_safe : 
    {
        bridgeTalk_script : function (serialInput) {
  
            /*global function for creating a jobSafe object with a private variable to store a folder reference*/
            if(typeof jobSafe2Maker !== 'function')
            {
                var jobSafe2Maker = function (initFolder) 
                {
                    var storedFolder = initFolder ? Folder(initFolder) : null;
                    return {
                        getset : function (args) {
                            if(args) {
                                if(args instanceof Folder) {
                                    storedFolder = args;
                                } else if (args instanceof String) {
                                    storedFolder = new Folder(args);
                                }
                            } else {
                                return storedFolder;
                            }
                        }
                    };
                };
            }
            
            var input = serialInput ? eval(serialInput) : null;
            
            /*if input is provided, check if there is a global jobSafe already*/
            if(input) {
                /* if there is, update the jobSafe with the provided folder*/
                if(typeof jobSafe2 != "undefined") {
                    jobSafe2.getset(input);
                    $.writeln('jobSafe updated');

                /* if there is no jobSafe, init it with the provided folder*/
                } else {                
                    jobSafe2 = jobSafe2Maker(input);
                    $.writeln('jobSafe initialized');
                }
            
            /*if no input is provided, check for a jobSafe*/
            } else {
                /*with a existing jobSafe return the stored folder*/
                if(typeof jobSafe2 != "undefined") {
                    $.writeln('jobSafe exists, retrieving saved folder');
                    return jobSafe2.getset().toSource();
                /*with no existing jobSafe and no input, return null*/
                } else {
                    $.writeln('no jobSafe, no input, nothing found');
                    return null;
                }
            }
        },

        showDialog : function (baseFolder) {

            if(baseFolder) {
                var retval = null;
                var kd = ($.getenv("COMPUTERNAME") === 'MONOTOWER') ? '/e/Kundendaten/' : '//192.168.3.112/Kundendaten/';
                var win = new Window('dialog', 'Choose Working Folder:');
                
                win.grp = win.add('group', undefined);
                win.grp.activePnl = win.grp.add('panel', undefined, 'Use last Folder?');
                win.grp.selectPnl = win.grp.add('panel', undefined, 'Select new Folder:');

                win.grp.activePnl.clientGrp = win.grp.activePnl.add('group', undefined);    
                win.grp.activePnl.folderGrp = win.grp.activePnl.add('group', undefined);
                win.grp.activePnl.okGrp = win.grp.activePnl.add('group', undefined);

                win.grp.activePnl.clientGrp.static = win.grp.activePnl.clientGrp.add('statictext', undefined, 'Client:');
                win.grp.activePnl.clientGrp.vari = win.grp.activePnl.clientGrp.add('statictext', undefined, decodeURI(baseFolder.parent.name));

                win.grp.activePnl.folderGrp.static = win.grp.activePnl.folderGrp.add('statictext', undefined, 'Job:');
                win.grp.activePnl.folderGrp.vari = win.grp.activePnl.folderGrp.add('statictext', undefined, decodeURI(baseFolder.name));      

                win.grp.activePnl.okGrp.ok = win.grp.activePnl.okGrp.add('button', undefined, 'Ok');
                win.grp.activePnl.okGrp.cancel = win.grp.activePnl.okGrp.add('button', undefined, 'Cancel');
                
                win.grp.selectPnl.b2b = win.grp.selectPnl.add('button',undefined, 'B2B');
                win.grp.selectPnl.b2c = win.grp.selectPnl.add('button',undefined, 'B2C');
                win.grp.selectPnl.client = win.grp.selectPnl.add('button',undefined, 'this Client');

                win.grp.activePnl.alignment = 'bottom';
                win.grp.activePnl.spacing = 18;

                win.grp.activePnl.okGrp.ok.onClick = function() {
                    retval = baseFolder;
                    win.close();
                };

                win.grp.activePnl.okGrp.cancel.onClick = function() {
                    win.close();
                };        

                win.grp.selectPnl.b2b.onClick = function() {
                    retval = Folder(kd + 'B2B').selectDlg('Select Job-Folder:');
                    win.close();
                };

                win.grp.selectPnl.b2c.onClick = function() {
                    retval = Folder(kd + 'B2C').selectDlg('Select Job-Folder:');
                    win.close();
                };

                win.grp.selectPnl.client.onClick = function() {                    
                    retval = baseFolder.parent.selectDlg('Select Job-Folder:');
                    win.close();
                };
                
                win.show();

                // if (retval === 'B2B' || retval === 'B2C') {
                //     retval = get_the_fking_folder(retval);
                // } else if(retval === 'client') {
                //     retval = baseFolder.parent.selectDlg('Select Job-Folder:');
                // }

                return retval;
            }
        },

        sendViaBT : function (func, args) {
            var bt = new BridgeTalk;
            
            bt.target = 'estoolkit';
            
            bt.body = func.toSource() + "("; 
            if(args) {bt.body += args.toSource();}       
            bt.body += ");";
            
            bt.onError = function(errObj) {
                $.writeln(errObj.body);
                bt.result = null;
            };

            bt.onResult = function (resObj) {                                              
                bt.result = eval(resObj.body);
            };

            bt.send(500);
            
            return bt.result;
        },

        getSet : function (new_ref) {
            if(new_ref) {
                switch(new_ref.constructor.name) {
                    // if user specifies a folder, set the jobsafe accordingly
                    case 'File' :
                    case 'Document' : this.sendViaBT(this.bridgeTalk_script, new_ref.path.parent);
                    break;
                    case 'Folder' : this.sendViaBT(this.bridgeTalk_script, new_ref);
                }
                    
            } else {
                // if not, check the jobSafe for a saved folderpath
                //var retval = this.bridgeTalk_script();
                var retval = this.sendViaBT(this.bridgeTalk_script);
                var selected = null;
                
                // if a folder is found in the jobSafe, let user choose to use it or change it
                if(retval) {
                    selected = this.showDialog(retval);
                
                // if no folder is found in jobSafe, show user dialog to choose a folder on disk
                } else {
                    selected = (mofo.folder('kd')).selectDlg('Select Job-Folder:');
                }

                // with nothing stored and user failed to choose sth, bail the fuck out
                if(!selected) {
                    return null;
                // without stored folder and the user chose one manually, set the jobSafe accordingly
                } else if (!retval) {
                    this.sendViaBT(this.bridgeTalk_script, selected);
                    return selected;
                
                // with a stored folder and user chose a folder, check if they match or set jobSafe accordingly if not
                } else if (retval.fullName != selected.fullName) {
                    this.sendViaBT(this.bridgeTalk_script, selected);
                    return selected;
                } else {
                    return selected;
                }
            }
        }
    },

    // checks for currently open or placed graphics to get a job reference
    // if no ref is found, checks extendscript toolkit for last used jobfolder (job_safe)
    get_ref : function () 
    {
        function check_apps () 
        {
            var retval = null,
                doc = null;

            switch (app.name) {

                case 'Adobe Illustrator' :
                    app.documents.length > 0 ? doc = app.activeDocument : doc = null;
                    if (doc) {
                        //check if activeDoc has a jobStyle FileName
                        if (rE.printTag.test(doc.name)) {
                            retval = doc;
                        
                        //if not, check if placedGraphic has a jobStyle FileName (only if its on Motiv-Layer)
                        } else if (doc.placedItems.length > 0) {
                            var i = null, pI = null;
                            for(i=0; i < doc.placedItems.length; i++) {
                                pI = doc.placedItems[i];
                                if(pI.layer == doc.layers.getByName('Motiv')) {
                                    retval = doc.placedItems[0].file;
                                }
                            }
                        
                        //if not, check if the whole filepath contains a jobnumber
                        } else if (rE.jobNr.test(doc.fullName)) {
                            retval = doc;
                        }
                    }
                break;
                
                case 'Adobe InDesign' :
                    if((app.documents.length > 0) && (app.layoutWindows.length > 0)) {
                        doc = app.activeDocument 
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
                            retval = doc;
                        } else if (doc.allGraphics.length > 0) {                    
                            try {
                                var checkThis = doc.layers.item('motivEbene');
                                var checkthis = checkThis.name;
                                retval = new File(checkThis.allGraphics[0].properties.itemLink.filePath);
                            } catch (e) {
                                retval = doc;
                            }
                        } else if (doc.saved && rE.printTag.test(doc.filePath.fullName)) {
                            retval = doc;
                        }
                    }
                break;

                case 'Adobe Photoshop' :
                    app.documents.length > 0 ? doc = app.activeDocument : doc = null;
                    try {
                        retval = doc;
                        var check = retval.fullName;
                        if (rE.printTag.test(doc.name)) {
                            retval = doc;
                        } else {
                            retval = null;
                            // retval = job.job_safe.getSet();
                        }
                    } catch(e) {
                        retval = null;
                        // retval = job.job_safe.getSet();
                    }
                break;
            }
            return retval;
        }

        //check adobe apps for open documents and try to get a reference file
        var active_doc = check_apps();
        if(active_doc) {
            return active_doc;        
        } else {   //if no docs are open, check the global job_safe Object in ESTK
            var saved_folder = this.job_safe.getSet();
            if(saved_folder) {
                return saved_folder;            
            } else {
                //if nothing works, sth. must is fishy
                return null;
            }
        }
    },

    set_nfo : function (ref, fullExtract)
    {
        var nfo = {},
            tempNfo= null;

        if(!ref) {
            ref = this.get_ref(fullExtract);
        }
        
        switch(ref.constructor.name) {            
            case 'File' : nfo.file = ref;
            break;
            case 'Folder' : nfo.folder = ref;
            break;
            case 'Document' : nfo.file = ref.fullName;
            break;
        }

        tempNfo = this.extract.all(ref, fullExtract);
        
        f_all.copyProps(tempNfo, nfo);
        f_all.copyProps(nfo, this.nfo);
        
        this.job_safe.getSet(this.nfo.folder);
    },
};

#include '/c/capri-links/scripts/includes/mofo.jsx'
#include '/c/capri-links/scripts/includes/rE.jsx'