//@target indesign
//@include 'require.jsx'


(function () {

    var select_docs = function (arrayOfFiles) {
        var result = {
            opts : {
                printMock:   false,
                printFH :    false,
                printFilme : false
            },
        
            files : []
        }

        var checkBoxes = [];

        var w = new Window ("dialog");
        w.alignChildren = "fill";

        
        var filesPnl = w.add("panel", undefined, "Ansicht wählen");
        filesPnl.alignChildren = "left";
        filesPnl.margins = [10,25,10,10];

        for (var i = 0; i < arrayOfFiles.length; i++) {
            checkBoxes.push(filesPnl.add ("checkbox", undefined, "\u00A0"+arrayOfFiles[i].displayName));
        }    
        
        var optsPnl = w.add("panel", undefined, "Ausgabe-Optionen");
        optsPnl.alignChildren = "left";
        optsPnl.margins = [10,25,10,10];

        optsPnl.printMock =     optsPnl.add("checkbox", undefined, "Ansicht drucken");
        optsPnl.printFH =       optsPnl.add("checkbox", undefined, "Filmhülle drucken");
        optsPnl.printFilme =    optsPnl.add("checkbox", undefined, "Film PDFs erstellen");
        
        var btnGrp   = w.add("group");
        btnGrp.alignChildren = "fill";
            

        var check = btnGrp.add ("button", undefined, "OK");
        check.onClick = function () {
            for (var i = 0; i < checkBoxes.length; i++){
                if(checkBoxes[i].value) {
                    result.files.push(arrayOfFiles[i]);
                }
            }
            w.close();
        }

        optsPnl.printMock.onClick = function () {
            result.opts.printMock = this.value;
        }
        optsPnl.printFH.onClick = function () {
            result.opts.printFH = this.value;
        }
        optsPnl.printFilme.onClick = function () {
            result.opts.printFilme = this.value;
        }

        var cancel = btnGrp.add("button", undefined, "Cancel");
        cancel.onClick = function () {
            w.close();
            return null;
        }
        
        w.show ();

        return result;
    };

    var print_docs = function (myFiles, printPreset) {
        for(var i = 0; i < myFiles.length; i++ ) {
            var myFile = myFiles[i];
            var doc = app.open(myFile,true);
            doc.print(false, printPreset);
            doc.close(SaveOptions.NO);
        }
    };

    var generate_wawi_strings = function (rowContent) {
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
    };

    var show_wawi_string_dialog = function (rowContents, job, copyToClipboard) {
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
                        copyToClipboard(this.parent.wawiText.text);
                    }
            }
        
            win.add('button', undefined, 'Ok');



        win.show();
    };
    
    var job = require('job');
    var jobFolder = require('jobFolder');
    var paths = require('paths');
    var f_all = require('f_all');
    var f_id = require('f_id');

    var MonoMockup = require('MonoMockup');
    var MonoTable = require('MonoTable');
    var MonoFilm = require('MonoFilm');

    var interactSwitch = require('InteractionSwitch');

    job.set_nfo(null,false);
    if(!job.nfo.folder) return;
    paths.set_nfo(job.nfo);
    jobFolder.set_folder(job.nfo.folder);

    interactSwitch.set('all');

    var ansichten = jobFolder.get_mockups();
    var filmhuelle = jobFolder.get_filmhuelle();
    var filme = jobFolder.get_filme();
    //if(filmhuelle && filmhuelle.length > 0) ansichten.push(filmhuelle[0]);

    var result = select_docs(ansichten);
    if(!result) return;

    var errors = [];
    var rowContents = [];
    
    for (var i = 0; i < result.files.length; i++) {
        var myFile = result.files[i];
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

    if(result.opts.printMock) {
        var printPreset = app.printerPresets.item('printMockup');
        print_docs(result.files, printPreset);
    }

    if (result.opts.printFH) {
        var printPreset = app.printerPresets.item('filmhuelle');    
        print_docs(filmhuelle, printPreset);
    }

    if (result.opts.printFilme) {
        for (var i=0, len=filme.length; i < len ; i++) {
            var monoFilm = new MonoFilm(app.open(filme[i]));
            monoFilm.print(paths.path('filmIn'), paths.path('filmOut'));
        }
    }

    interactSwitch.set('all');
    
    if(rowContents.length > 0) {
        show_wawi_string_dialog(rowContents, job, f_all.copyToClipboard);
    }
})()
