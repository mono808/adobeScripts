#target indesign

function main() {
    
    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'f_id_mock.jsx'
    #include 'Job.jsx'
    #include 'Pathmaker.jsx'
    #include 'MonoNamer.jsx'
    #include 'MonoGraphic.jsx'
    #include 'MonoPrint.jsx'
    #include 'MonoMockup.jsx'
    #include 'MonoTable.jsx'
    #include 'MonoFilm.jsx'
    #include 'MonoSep.jsx'
    #include 'Typeahead.jsx'
    #include 'TexAdder.jsx'    
    #include 'InteractSwitch.jsx'
    #include 'save_Options.jsx'

    var job = new Job(null,false);
    var pm = new Pathmaker(job.nfo);
    //var jobFolder = new JobFolder(job.nfo.folder);

    function get_docs () 
    {
        var myDocs = {
            ansichten : [],
            filmhuelle : null,
        };
        
        var mockUps = pm.folder('ansicht').getFiles('*.indd');
        var i, maxI;            
        for(i = 0, maxI = mockUps.length; i < maxI; i += 1){
            //if(mockUps[i] instanceof File && rE.doc.test(decodeURI(mockUps[i].name))) {
            if(mockUps[i] instanceof File) {
                myDocs.ansichten.push(mockUps[i]);
            }
        }
        
        var filmhuelle = pm.file('filmhuelle');
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

    function print_docs (docs, print)
    {
        // Ansichten ausdrucken       
        for(var i=0; i < docs.ansichten.length; i+=1){
            var doc = app.open(docs.ansichten[i],true);
            
            var rowConts = f_id_mock.read_tables(doc);
            var rowObjs = f_id_mock.generate_wawi_strings(rowConts);
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

    var  errors = [];
    for (var i = 0; i < filesToPrint.ansichten.length; i++) 
    {
        var monoMockup = new MonoMockup(app.open(filesToPrint.ansichten[i],true));
        for (var j = 0; j < monoMockup.doc.pages.length; j++) 
        {
            var myPage = monoMockup.doc.pages[j];
            var isOnPreviewPage = myPage.appliedMaster == monoMockup.doc.masterSpreads.item('C-Preview');
            if(isOnPreviewPage) continue;
            var monoGraphics = monoMockup.get_monoGraphics(myPage, monoMockup.layers.prints);
            for (var k = 0; k < monoGraphics.length; k++) 
            {
                var mG = monoGraphics[k];
                if(!mG.check_size()) 
                {   
                    errors.push(mG);
                }
            }
        }
    }
    if(errors.length > 0) {
        var alertStr = 'Druckgrößen in Ansicht weicht von Druckdaten ab / konnten nicht geprüft werden.\nTrotzdem weitermachen?';
        if(!Window.confirm(alertStr)) return null;
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