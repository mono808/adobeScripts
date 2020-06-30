#target indesign

function select_docs (arrayOfFiles) {
    var result = {
        action : undefined,
        files : []
    }

    var checkBoxes = [];
    var w = new Window ("dialog");
    w.alignChildren = "fill";
    
    var checkPnl = w.add("panel");
    checkPnl.alignChildren = "left";
    
    var btnGrp   = w.add("group");
    btnGrp.alignChildren = "fill";
    
    for (var i = 0; i < arrayOfFiles.length; i++) {
        checkBoxes.push(checkPnl.add ("checkbox", undefined, "\u00A0"+arrayOfFiles[i].displayName));
    }
    
    var print = btnGrp.add ("button", undefined, "Print");
    print.onClick = function () {
        for (var i = 0; i < checkBoxes.length; i++){
            if(checkBoxes[i].value) {
                result.files.push(arrayOfFiles[i]);
            }
        }
        result.action = 'print';
        w.close();
    }

    var check = btnGrp.add ("button", undefined, "Check");
    check.onClick = function () {
        for (var i = 0; i < checkBoxes.length; i++){
            if(checkBoxes[i].value) {
                result.files.push(arrayOfFiles[i]);
            }
        }
        result.action = 'check';
        w.close();
    }    
    

    var cancel = btnGrp.add("button", undefined, "Cancel");
    cancel.onClick = function () {
        selectedFiles = [];
        w.close()
    }
    
    w.show ();

    return result;
}

function print_docs (myFiles)
{
    var fhPPreset = app.printerPresets.item('filmhuelle');
    var muPPreset = app.printerPresets.item('printMockup');

    for(var i = 0; i < myFiles.length; i++ ) {
        var myFile = myFiles[i];
        var doc = app.open(myFile,true);
        if(myFile.displayName.match(/Ansicht.*\.indd/i)) {
            doc.print(false, muPPreset);
            doc.close(SaveOptions.ASK);
        } else {
            doc.print(false, fhPPreset);
            doc.close(SaveOptions.YES);
        }
    }
}

function generate_wawi_strings (rowContent)
{
    var resStrings = [];
    var texString;
    var wawiString;
    var rowStrings = {};
              
    texString  = rowContent.run;  // Stückzahl
    texString += 'x ';               
    texString += rowContent.textilName;  // Artikel
    texString += ' in ';
    texString += rowContent.textilColor;  // Farben
    texString += ' - Druckposition: ';
    texString += rowContent.printId;  // Druckposi

    wawiString  = 'Produktionsdetails: ';
    wawiString += rowContent.tech == 'Siebdruck' ? 'Druckfarben (~ Pantone C): ' : 'Druckfarben: ';
    wawiString += rowContent.colors;
    wawiString += ' - Druckbreite: ca. ';
    wawiString += rowContent.width/10;
    wawiString += ' cm - Motiv: ';
    
    rowStrings.textil = texString;
    rowStrings.wawi = wawiString;

    return rowStrings;
}

function show_wawi_string_dialog (rowContents, job, copyToClipboard) 
{
    var result = null;
    var dialogTitle;
    dialogTitle = "WaWi Infos nachtragen zu ->  ";
    dialogTitle += job ? job.nfo.jobNr + ' - ' + job.nfo.client : 'irgendeinem bekloppten Auftrag';

    var win = new Window ('dialog', dialogTitle);
    win.alignChildren = 'right';
        var aPnl;
        for(var i = 0; i < rowContents.length; i++) {
            var rowContent = rowContents[i];
            var rowStrings = generate_wawi_strings(rowContent);
            aPnl = win.add('panel', undefined, '');
            aPnl.alignment = 'fill';
            aPnl.alignChildren = 'left';
            aPnl.add('statictext', undefined, rowStrings.textil);
            aPnl.wawiGroup = aPnl.add('group', undefined, '');
            aPnl.wawiGroup.alignChildren = 'fill';
            aPnl.wawiGroup.wawiText = aPnl.wawiGroup.add('edittext', undefined, rowStrings.wawi);
            aPnl.wawiGroup.wawiText.preferredSize = [500, 25];
            aPnl.wawiGroup.copyButton = aPnl.wawiGroup.add('button', undefined, 'copy to clipboard');
            aPnl.wawiGroup.copyButton.onClick = function () {
                    copyToClipboard.copy(this.parent.wawiText.text);
                }
        }
    
        win.add('button', undefined, 'Ok');



    win.show();
}

function main() {
    
     
    #include 'augment_objects.jsx'
    #include 'Job.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'JobFolder.jsx'
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
    var jobFolder = new JobFolder(job.nfo.folder);

    var iASwitch = new InteractSwitch();
    iASwitch.set('all');

    var myDocs = jobFolder.get_mockups();
    var filmhuelle = jobFolder.get_filmhuelle();
    if(filmhuelle && filmhuelle.length > 0) myDocs.push(filmhuelle[0]);

    var result = select_docs(myDocs);
    if(result.files.length < 1) return;

    var errors = [];
    var rowContents = [];
    
    // loop through all files
    for (var i = 0; i < result.files.length; i++) {
        var myFile = result.files[i];
        if(myFile.displayName.match(/Ansicht.*\.indd/i)) {
            var monoMockup = new MonoMockup(app.open(myFile,true));
            var layerToggle = f_id.layerToggle(['Intern']);
            layerToggle.show();
            for (var j = 0; j < monoMockup.doc.pages.length; j++) {
                var monoTable = new MonoTable(monoMockup.doc.pages[j]);
                var pageRowContents = monoTable.read_rows();
                if(pageRowContents) {
                    rowContents = rowContents.concat(pageRowContents);
                }
            }

            var monoGraphics = monoMockup.get_all_monoGraphics();

            for (var k = 0; k < monoGraphics.length; k++) {
                var mG = monoGraphics[k];
                var checkResult = mG.check_size();
                if((Math.abs(checkResult.sizeDif) > 2) || (Math.abs(checkResult.posDif) > 1.5) || Math.abs(checkResult.placedDif) > 1) {
                    errors.push({mG:mG, result: checkResult});
                }
            }
        }
    }

    if(errors.length > 0) {      
        var alertStr = '';        

        for (var i=0, len=errors.length; i < len ; i++) {
            var e = errors[i];
            alertStr += 'Motiv ';
            alertStr += e.mG.get_printId();
            alertStr += ':\r';
            if(e.result.sizeDif == null) {
                alertStr = 'Größe / Platzierung konnte nicht geprüft werden\r\r';
                continue;
            }

            if(Math.abs(e.result.sizeDif) > 2) {
                alertStr += 'Größe abweichend um: ' + e.result.sizeDif.toFixed(1) + ' mm\r\r';
            }
/* 
            if(Math.abs(e.result.posDif) > 1) {
                 alertStr += 'Platzierung abweichend um: ' + e.result.posDif.toFixed(1) + ' mm\r\r';
            }
*/
            if(Math.abs(e.result.placedDif) > 1) {
                alertStr += 'Zentrierung abweichend!\r\r';
                alertStr += e.result.previewPlacement.percentage.toFixed(1);
                alertStr += '% in Ansicht\r';
                alertStr += e.result.sepPlacement.percentage.toFixed(1);
                alertStr += '% auf Film \r\r';
            }
        }

        alertStr += '\rAbweichung ignorieren und weitermachen?';

    if(!Window.confirm(alertStr)) {
        return null;}
    }

    // objs containing the strings extracted from the mockup to copy to wawi    
    if(result.action === 'print') {
        print_docs(result.files);
    }

    iASwitch.set('all');
    show_wawi_string_dialog(rowContents, job, f_all.copyToClipboard);
}

main();
