﻿#target indesign

function select_docs (arrayOfFiles) {
    var selectedFiles = [];
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
                selectedFiles.push(arrayOfFiles[i]);
            }
        }
        w.close();
    }

    var cancel = btnGrp.add("button", undefined, "Cancel");
    cancel.onClick = function () {
        selectedFiles = [];
        w.close()
    }
    
    w.show ();

    return selectedFiles;
}

function print_docs (myFiles)
{
    var fhPPreset = app.printerPresets.item('filmhuelle');
    var muPPreset = app.printerPresets.item('printMockup');

    for(var i = 0; i < myFiles.length; i++ ) {
        var myFile = myFiles[i];
        var doc = app.open(myFile,true);
        if(myFile.displayName.match(/Ansicht\.indd/i)) {            
            doc.print(false, muPPreset);
            doc.close(SaveOptions.ASK);
        } else {
            doc.print(false, fhPPreset);
            doc.close(SaveOptions.YES);
        }
    }
}

function main() {
    
    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'f_id_mock.jsx'
    #include 'Job.jsx'
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
    iASwitch.set('none');

    var myDocs = jobFolder.get_mockups();
    var filmhuelle = jobFolder.get_filmhuelle();
    if(filmhuelle) myDocs.push(filmhuelle[0]);

    var filesToPrint = select_docs(myDocs);
    if(filesToPrint.length < 1) return;

    var errors = [];
    var rowContents = [];
    
    // loop through all files
    for (var i = 0; i < filesToPrint.length; i++) {
        var myFile = filesToPrint[i];
        if(myFile.displayName.match(/Ansicht\.indd/i)) {
            var monoMockup = new MonoMockup(app.open(myFile,true));
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
                if(!mG.check_size()) {   
                    errors.push(mG);
                }
            }
        }
    }

    if(errors.length > 0) {
        var alertStr = 'Druckgrößen in Ansicht weicht von Druckdaten ab / konnten nicht geprüft werden.\nTrotzdem weitermachen?';
        if(!Window.confirm(alertStr)) return null;
    }

    // objs containing the strings extracted from the mockup to copy to wawi    
    print_docs(filesToPrint);

    iASwitch.set('all');
    //if(ok) f_id_mock.create_ui(rowObjs, job);
    if(ok) f_id_mock.create_wawi_string_dialog(rowObjs, job);
}

main();
