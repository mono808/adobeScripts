#target indesign

function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'f_id_mock.jsx'    
    #include 'Job.jsx'
    #include 'save_Options.jsx'
    #include 'MonoNamer.jsx'
    #include 'Pathmaker.jsx'
    #include 'Typeahead.jsx'
    #include 'TexAdder.jsx'

    //(refDoc, fullextract, nachdruckMöglich)
    var job = new Job(null, false, true);
    var pm = new Pathmaker(job.nfo);
    var texAdder = new TexAdder();

    var templateFile, templateDoc,
        templateFiles = [
            pm.file('mockBagMaster'),
            pm.file('mockShirtMaster')
        ];

    // chose template to use (shirts bags whatever)
    templateFile = f_all.choose_from_array(templateFiles, 'displayName');
    templateDoc = templateFile ? app.open(templateFile) : null;
    if(!templateDoc)return;


    //create doc preset based on the chosen template document
    var newDocPreset = f_id.createDocPresetFromMaster();
    

    // create new doc with this docPreset Object (will be the final mockup doc)
    var newDoc = app.documents.add(true, newDocPreset, {});
    newDoc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;


    // copy styles, layers and masterpages from template file to mockup doc
    f_id.copyStyles(templateDoc, newDoc);
    f_id.copyLayers(templateDoc, newDoc);
    f_id.copyMasterPages(templateDoc, newDoc);

    
    //label the pages based on the placed textile graphics (shirts, sweats, polos, kinds of bags)    
    f_id_mock.labelPages(templateDoc);


    //let user choose which spreads to copy to the final mockup doc
    var typeahead = new Typeahead();
    var selectedPages = typeahead.show_dialog(templateDoc.pages, 'label');
    //var selectedPages = f_id_mock.selectTextilePages(templateDoc);
    f_id_mock.copySpreads(templateDoc, newDoc, selectedPages);
    templateDoc.close();

    // show the shop logo (cs or wme)
    f_id_mock.showShopLogo(job.shop);
    

    // fill the job infos (client, jobnr)
    f_id_mock.fillJobInfos(job.nfo);


    // let user choose the shirt/bag color to show (via object layer options of placed graphic files)
    f_id_mock.choose_textil_color();

    if(app.activeDocument.saved === false) {
        if(pm.file('mockUpIndd').exists) {
            var newJob = Window.prompt('Ansicht existiert, bitte neu JobNr angeben (oder die Ansicht wird überschrieben)', job.nfo.jobNr);
            var newFile = new File(pm.file('mockUpIndd').path + '/' + pm.file('mockUpIndd').displayName.replace(rE.jobNr, newJob));
            f_all.saveFile(newFile, undefined, false);
        } else {
            f_all.saveFile(pm.file('mockUpIndd'), undefined, false);
        }
    }

    if(Window.confirm('Drucke platzieren?')) {
        var printsToPlace = f_id_mock.getPrints(job.nfo.folder);
        try {f_id_mock.placePrintsOnPage(printsToPlace);}
        catch(e) {alert("Couldn't place prints, do it manually plz");}
    }

    var prePage = f_id_mock.add_preview_page();
    var rec = f_id_mock.add_preview_rectangle(prePage);
    f_id.split_frame(rec);

    if(app.activeDocument.saved === false) {
        f_all.saveFile(app.activeDocument.fullName, undefined, false);
    }
}

function check() {
    return true;
}

if(check()) {
    main();
}
