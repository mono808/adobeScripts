var f_all = {

    is_number : function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },

    validateString : function (str) {
        var rE, ret1;
        rE = /[^a-zA-Z0-9-äöüÄÖÜ]/g;            
        ret1 = str.replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/Ä/g,"Ae").replace(/Ö/g,"Oe").replace(/Ü/g,"Ue").replace(/ß/g,"ss").replace('_', '-').replace(rE, '');        
        return ret1;
    },

    copyProps : function (src, dest) {
        var p;
        for(p in src) {
            if(src.hasOwnProperty(p) && src[p]) {
                dest[p] = src[p];
            }
        }
    },
        
    send_sep_to_indesign : function (sepFile, pos) 
    {

        function script2Send (serializedmyArgs) {            

            function centerOnPage (itemRef)
            {
                var iWidth = itemRef.geometricBounds[3] - itemRef.geometricBounds[1];
                var iHeight = itemRef.geometricBounds[2] - itemRef.geometricBounds[0];
                var myDoc = app.activeDocument;
                var pWidth = myDoc.documentPreferences.pageWidth;
                var pHeight = myDoc.documentPreferences.pageHeight;
                
                var centerCoor = {};
                centerCoor.x = pWidth/2 - iWidth /2;
                centerCoor.y = pHeight/2 - iHeight /2;
                itemRef.parent.move( [centerCoor.x, centerCoor.y] );
            }
        
            function positionSep (x,y)
            {
                var doc = app.activeDocument;
                var vLine = doc.pages[0].guides.item('vLine');
                var hLine = doc.pages[0].guides.item('hLine');
                mySep.parent.move( [vLine.location + x, hLine.location + y] );
            }

            var myArgs = eval(serializedmyArgs);
            var iDoc = app.activeDocument;
            var myPage = iDoc.pages[0];
            var sepLayer = iDoc.layers.item('motivEbene');
            var sepRef = myPage.place(myArgs.sep);
            var mySep = iDoc.layers.item('motivEbene').allGraphics[0];
            
            iDoc.activeLayer = sepLayer;
            
            if (myArgs.x != null && myArgs.y != null) {
                positionSep(myArgs.x, myArgs.y);
                /*app.doScript(myArgs.finalizeScript);*/
                return 'Sep placed according to PlacementInfos';
            } else {
                centerOnPage(mySep);
                return 'Sep centered on Page';
            }
        }
        
        //var jsFilmBlanko = this.read_file(File('/c/capri-links/scripts/indesign/Film_1_Blanko.jsx'));      
        indesign.executeScriptFile(File('/c/repos/adobeScripts1/indesign/Film_1_Blanko.jsx'));

        var myArgs = {};
        myArgs.sep = sepFile;
        myArgs.x = pos && pos.x ? pos.x.as('mm') : null;
        myArgs.y = pos && pos.y ? pos.y.as('mm') : null;

        var bt = new BridgeTalk;
        bt.target = 'Indesign';        
        bt.body = script2Send.toSource() + "(" + myArgs.toSource() + ");";      
        bt.onResult = function( inBT ) { $.writeln(inBT.body) };
        bt.onError = function( inBT ) { $.writeln(inBT.body) };
        bt.send(0);

        //var jsFilmFinalize = this.read_file(File('/c/capri-links/scripts/indesign/Film_2_Finalisieren.jsx'));      
        indesign.executeScriptFile(File('/c/repos/adobeScripts1/indesign/Film_2_Finalisieren.jsx'));

        return;
    },

    read_file : function (aFile) {     
        if(aFile && aFile instanceof File) {
            aFile.open('r', undefined, undefined);
            aFile.encoding = "UTF-8";      
            aFile.lineFeed = "Windows";
            return aFile.read();
        }
    },

    typeOf : function (v) 
    {
        var ret=typeof(v);
        if (ret!="object") {
            return ret;
        } else if(v==null) {
            return "null";  
        } else {
            return Object.prototype.toString.call(v).slice(8,-1);       
        }
    },
    
    get_kuerzel : function () 
    {
        var username = $.getenv('USERNAME');
        
        if(username.indexOf('.') > 0) {
            // if username contains . make kuerzel from username jan.untiedt -> JU
            return (username.split('.')[0][0] + username.split('.')[1][0]).toUpperCase();        
        } else {
            return username;
        }
    },
    
    saveFile : function (dest, saveOps, close) 
    {
        var saveFile,
            saveFolder,
            saveDoc;      

        if(dest instanceof File) {
            saveFile = dest;
        } else {
            saveFile =  new File(dest);
        }
        
        if (!saveFile.parent.exists) {
            saveFolder = new Folder(saveFile.parent)
            saveFolder.create();
        };

        saveDoc = app.activeDocument;


        try {
            switch (app.name) {
                case 'Adobe Illustrator' :
                    saveDoc.saveAs(saveFile, saveOps);      
                break;
                case 'Adobe InDesign' :
                    saveDoc.save (saveFile);
                break;
                case 'Adobe Photoshop' :
                    saveDoc.saveAs(saveFile, saveOps);
                break;
            }

            if(close) {saveDoc.close()};
            return true;

        } catch(e) {
            alert(e);
            return false;
        }
    },
    
    openFile : function (source) 
    {
        var sourceFile = new File (source);
        var fileRef = app.open (sourceFile);
        return fileRef;
    },
    
    startDistiller : function () 
    {
        var dist10 = File('/c/Program Files (x86)/Adobe/Acrobat 10.0/Acrobat/acrodist.exe'),
            dist11 = File('/c/Program Files (x86)/Adobe/Acrobat 11.0/Acrobat/acrodist.exe');

        var secsWaited = 0,
            distApp;

        if(dist10.exists) {
            distApp = dist10;
        } else if (dist11.exists) {
            distApp = dist11;
        }

        if(distApp && distApp.execute()) {        
            $.sleep(1000);
            switch (app.name) {

                case 'Adobe Illustrator' :
                    BridgeTalk.bringToFront('illustrator');       
                break;
                
                case 'Adobe InDesign' :
                    app.activate();
                break;

                case 'Adobe Photoshop' :
                    app.bringToFront();
                break;
            }
            return true;
        } else {
            alert("Distiller was not found / couldn't start");
            return false;
        }
    },

    //wf = workingfolder, newName = name of the duplicated folder
    duplicateFolder : function (wf, destination, newName, refFile) 
    {
        var dupedFolder = new Folder(destination.absoluteURI + '/' + newName),
            tempFolder;

        var FilesFolders = wf.getFiles('*.*'),
            FileFolder,
            files2move = [],
            myFile,
            dupedFile,
            folders2move = [],            
            myFolder,
            filesCool = true,
            i,
            maxI;

        // create containing folder if it doesn't yet exist
        if (!dupedFolder.parent.exists) {
            tempFolder = new Folder(dupedFolder.parent);
            tempFolder.create();
        };
        dupedFolder.create();

        //select files and folder that should be moved
        //if wf does not contain the current client art file
        //mark all contained files and folders for moving
        if (wf.fullName !== refFile.path) {
            for (i = 0, maxI = FilesFolders.length; i < maxI; i += 1) {
                FileFolder = FilesFolders[i];
                if (FileFolder instanceof File) {
                    files2move.push(FileFolder);
                } else if (FileFolder instanceof Folder) {
                    folders2move.push(FileFolder);
                }
            }

        //if wf DOES contain the current client art file -> normally Kundendaten      
        //only select this specific art file and all folders for moving
        //prevents all other client files from being moved to the new design folder
        } else if (wf.fullName === refFile.path) {
            for (i = 0, maxI = FilesFolders.length; i < maxI; i += 1) {
                FileFolder = FilesFolders[i];
                if (FileFolder instanceof File && FileFolder.fullName === refFile.fullName) {
                    files2move.push(FileFolder);
                } else if (FileFolder instanceof Folder) {
                    folders2move.push(FileFolder);
                }
            }
        }

        //move all selected files to duplicated folder
        for (i = 0, maxI = files2move.length; i < maxI; i += 1) {
            myFile = files2move[i];
            dupedFile = new File (dupedFolder.absoluteURI + '/' + myFile.name);
            // remove the source file, if copied successfully
            if (myFile.copy(dupedFile)) {
                myFile.remove();
            } else {
                // set flag if sth went wrong, so the parent folder does not get deleted later
                filesCool = false;
                $.writeln('could not copy File: ' + myFile.name);
            }
        };

        // recursive duplicate the selected folders
        for (i = 0, maxI = folders2move.length; i < maxI; i += 1) {
            myFolder = folders2move[i];
            f_all.duplicateFolder(myFolder, dupedFolder, myFolder.name, refFile);
        }

        //if all contained files copied fine and nothing left in the directory, delete it
        //otherwise leave as is
        if(filesCool && (wf.getFiles('*.*').length === 0)) {            
            $.writeln(wf.name + ' was ' + (wf.remove() ? '' : 'NOT ') + 'removed!');
        } else if (wf.getFiles('*.*').length > 0) {
            $.writeln(wf.name + ' still contains files, folder not removed');
        } else if (!filesCool) {
            $.writeln('Sth went wrong moving the files, ' + wf.name + ' was not removed');
        };
    },
    
    copy_file_via_bridgeTalk : function (sourceFile, destFolder, deleteSource) 
    {
        
        function done ( err, data ) 
        {
            if ( err ) {
                alert(data);
                $.writeln(data);
            } else {
                alert(data);
                $.writeln(data);
            }
        }

        function copyFile(mySerializedArgs)
        {
            var args = eval(mySerializedArgs),
                destString,
                destFile,
                secsWaited = 0;

            waitLoop : while(!args.src.exists)
            {
                $.sleep(3000);
                secsWaited += 3;
                if(!args.src.exists && secsWaited > 20) {
                    if(Window.confirm('Out-PDF konnte nicht gefunden werden, bitte Filmrechner / Distiller prüfen! Kopieren jetzt nochmal probieren?')) {
                        secsWaited = 0;
                        continue waitLoop;
                    } else {
                        return args.src.displayName + "  konnte nicht gefunden werden. Ist der Filmrechner wirklich an? 8/";
                    }
                }
            }

            destString = decodeURI(args.dest.fullName) + "/" + decodeURI(args.src.name);
            destFile = new File (destString);
            if (!args.dest.exists) {args.dest.create()};

            var tries = 0;
            while(!args.src.copy(destFile)) 
            {
                if(tries > 5) {return "Datei : "+ destFile.displayName + " ist da, konnte aber nicht kopiert werden. Ist die Datei am Zielort evtl. noch geöffnet?";}
                tries+=1;
                $.sleep(3000);
            }

            if(args.delsource) 
            {
                args.src.remove();
                args.src = null;
                return "Datei : "+ destFile.displayName + " wurde erfolgreich verschoben . --> 0";
            } else {
                return "Datei : "+ destFile.displayName + " wurde erfolgreich kopiert 0 --> 0";
            }
        }

        var myArgs = { delsource : deleteSource || false },
            tempFile,
            tempFolder;

        if(sourceFile instanceof File) {
            myArgs.src = sourceFile;
        } else {
            myArgs.src = new File(sourceFile);
        }

        if(destFolder instanceof Folder) {
            tempFolder = destFolder;
        } else {
            tempFolder = new Folder(destFolder);
        }

        if(tempFolder.exists) {
            myArgs.dest = tempFolder;
        } else {
            alert('Destinationfolder not found');
            return;
        }

        //for debugging, execute function directly without bridgetalk
        // alert(copyFile(myArgs.toSource()));
        
        if(myArgs.src && myArgs.dest)
        {
            var bt = new BridgeTalk;
            bt.target = 'estoolkit';            
            bt.body = copyFile.toSource() + "(" + myArgs.toSource() + ");";
            bt.onResult = function( inBT ) { done( null, inBT.body ); };       
            bt.onError = function( inBT ) { done( 1, inBT.body ); };
            bt.send(0);
        }

        return;
    },
    
    choose_from_array : function (myArray, propToList, dialogTitle)
    {
        var result = null;
        var win = new Window('dialog', dialogTitle || 'Die Qualle & der Wal:');
        win.spacing = 4;
        
        var helper = function (i) {
            return function (e) {
                result = myArray[i];
                //alert('Wow SUPER. Nee echt, ganz toll gemacht...');
                win.close();
            }
        }

        try {
            var i,
                maxI,
                listEntry;

            for (i = 0, maxI = myArray.length; i < maxI; i += 1) {

                listEntry = propToList ? myArray[i][propToList].toString() : myArray[i].toString();

                win[i] = win.add("button", [25, 25, 250, 45], listEntry.toString());
                win[i].onClick = helper(i);
            };

        } catch (e) {
            alert(e);
        };
               
        win.show();
        return result;
    },

    choose_from_array_indd : function (myArray, propToList, dialogTitle) 
    {
    },

    choose_multiple_from_array : function (myArray, propToList, dialogTitle)
    {
        var result = null;
        
        var win = new Window('dialog', dialogTitle || 'Please choose:');
        win.spacing = 4;
        
        var rdPnl = win.add('panel', undefined, '');
        var okGrp = win.add('group', undefined, '');

        var i,
            maxI,
            listEntry;

        for (i = 0, maxI = myArray.length; i < maxI; i += 1) 
        {
            listEntry = propToList ? myArray[i][propToList].toString() : myArray[i].toString();
            rdPnl[i] = rdPnl.add("checkbox", [25, 25, 250, 50], listEntry.toString());
            rdPnl[i].value = false;
        };

        okGrp.yes = okGrp.add('button', undefined, 'Ok');
        okGrp.no =  okGrp.add('button', undefined, 'Abbrechen');

        okGrp.yes.onClick = function () {

            var i, maxI, retArray = [], chkbx;
            for (i=0, maxI = rdPnl.children.length; i<maxI; i+=1) {
                chkbx = rdPnl.children[i];
                if(chkbx.value) {
                    retArray.push(myArray[i]);
                }
            }
            win.close();
            result = retArray;
        };

        okGrp.no.onClick = function() {
            result = null;
            win.close();
        };
               
        win.show();
        return result;
    },

    escapeRegExp : function (str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
};




