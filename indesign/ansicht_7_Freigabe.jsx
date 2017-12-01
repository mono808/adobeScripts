#target indesign

function main() {
    
    #includepath '/c/capri-links/scripts/includes'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'f_id_mock.jsx'
    #include 'Job.jsx'
    #include 'MonoNamer.jsx'
    #include 'MonoGraphic.jsx'
    #include 'InteractSwitch.jsx'
    #include 'save_Options.jsx'

    var job = new Job(null,false);

    function get_docs () 
    {
        var myDocs = {
            ansichten : [],
            filmhuelle : null,
        };
        
        var mockUps = mofo.folder('ansicht').getFiles('*.indd');
        var i, maxI;            
        for(i = 0, maxI = mockUps.length; i < maxI; i += 1){
            //if(mockUps[i] instanceof File && rE.doc.test(decodeURI(mockUps[i].name))) {
            if(mockUps[i] instanceof File) {
                myDocs.ansichten.push(mockUps[i]);
            }
        }
        
        var filmhuelle = mofi.file('filmhuelle');
        if(filmhuelle.exists) {
            myDocs.filmhuelle = filmhuelle;
        }
        return myDocs;
    }

    function choose_docs (allDocs)
    {
        var result = {
            ansichten : [],
            filmhuelle : null
        };
        
        var win = new Window('dialog {text: "Dokumente ausdrucken: ", alignChildren: "fill"}');
        win.spacing = 4;
        
        var ansPnl = win.add('panel', undefined, '');
        ansPnl.alignChildren = 'left';
        
        if(allDocs.filmhuelle) {
            var fhPnl = win.add('panel', undefined, '');
            fhPnl.alignChildren = 'left';
        }
        
        var btnGrp = win.add('group', undefined, '');
        btnGrp.alignment = 'right';
        

        var i,
            maxI,
            ansicht;

        for (i = 0, maxI = allDocs.ansichten.length; i < maxI; i += 1) 
        {
            ansicht = allDocs.ansichten[i];
            ansPnl[i] = ansPnl.add("checkbox", undefined, decodeURI(ansicht.name));
            ansPnl[i].value = false;
        };

        if(fhPnl) {var fhChkbox = fhPnl.add('checkbox', undefined, 'Filmhülle');}

        btnGrp.yes = btnGrp.add('button', undefined, 'Ok');
        btnGrp.no =  btnGrp.add('button', undefined, 'Abbrechen');

        btnGrp.yes.onClick = function () {

            var i, maxI, chkbx;
            for (i=0, maxI = ansPnl.children.length; i<maxI; i+=1) {
                chkbx = ansPnl.children[i];
                if(chkbx.value) {
                    result.ansichten.push(allDocs.ansichten[i]);
                }
            }
            
            if(fhChkbox && fhChkbox.value) {
                result.filmhuelle = allDocs.filmhuelle;
            }

            win.close();
        };

        btnGrp.no.onClick = function() {
            result = null;
            win.close();
        };
               
        win.show();
        return result;
    }

    function check_sizes (ansichtDoc) 
    {
        var i, g, monoGraphic, mismatches = [];
        for(i=0; i<ansichtDoc.allGraphics.length; i++){
            g = ansichtDoc.allGraphics[i];
            fN = g.properties.itemLink.name;
            if(g.properties.itemLayer == ansichtDoc.layers.item('Prints') &&
               g.parentPage.appliedMaster != ansichtDoc.masterSpreads.item('C-Preview')) {
                monoGraphic = new MonoGraphic(g);
                if(!monoGraphic.check_size()) {
                    mismatches.push(monoGraphic.fileName)
                }
            }
        }

        if(mismatches.length > 0) {
            var chkStr = 'Size of Preview does not match Film:\n';
            chkStr += mismatches.join('\n');
            alert(chkStr);
            return false;
        } else {
            return true;
        }
    }

    function print_docs (docs, print)
    {
        // Ansichten ausdrucken
        var i, maxI, doc, rowConts;
        for(i=0, maxI = docs.ansichten.length; i<maxI; i+=1){
            doc = app.open(docs.ansichten[i],true);

            if(!check_sizes(doc)) {
                doc.close(SaveOptions.YES);
                return false;
            }
            
            rowConts = f_id_mock.read_tables(doc);
            rowObjs = f_id_mock.generate_wawi_strings(rowConts);
            if(print) {doc.print(false, muPPreset)}
        }
                    
        if (print && docs.filmhuelle) {
            doc = app.open(docs.filmhuelle);
            doc.print(false, fhPPreset);
            doc.close(SaveOptions.YES);
        }

        return true;
    }

    var iASwitch = new InteractSwitch();
    iASwitch.set('none');

    var fhPPreset = app.printerPresets.item('filmhuelle');
    var muPPreset = app.printerPresets.item('printMockup');

    var myDocs = get_docs();    

    var filesToPrint = choose_docs(myDocs);

    ///////////////////////////
    // var ok = ;
    // for(var i = 0; i < filesToPrint.ansichten; i+=1) {
    //     var 
    // }
    // var ok = check_sizes(filesToPrint.ansichten);
    //////////////////////////

    if(filesToPrint.ansichten.length < 1 && !filesToPrint.filmhuelle) {
        return;
    }

    var rowObjs; // objs containing the strings extracted from the mockup to copy to wawi    

    var ok = print_docs(filesToPrint, true);

    iASwitch.set('all');
    //if(ok) f_id_mock.create_ui(rowObjs, job);
    if(ok) f_id_mock.create_wawi_string_dialog(rowObjs, job);
}

function check() {    
    return true;
}

if(check()){
    main();
}