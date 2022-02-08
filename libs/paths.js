var f_all = require("f_all");

var nfo = {
    jobNr: "0000A17-014",
    jobName: "JohnDoe",
    printId: "somewhere",
    wxh: null,
    tech: "ANY"
};

var varsSet = false;

var paths = {};
paths.ansichtIn = PCROOT + "/distiller/ansicht/in/";
paths.ansichtOut = PCROOT + "/distiller/ansicht/out/";
paths.ansichtHQIn = PCROOT + "/distiller/ansichtHQ/in/";
paths.ansichtHQOut = PCROOT + "/distiller/ansichtHQ/out/";
paths.ansichtPxIn = PCROOT + "/distiller/ansichtPixel/in/";
paths.ansichtPxOut = PCROOT + "/distiller/ansichtPixel/out/";
paths.filmIn = PCROOT + "/distiller/filme/in/";
paths.filmOut = PCROOT + "/distiller/filme/out/";
paths.rolleIn = PCROOT + "/distiller/filmrollen/in/";
paths.rolleOut = PCROOT + "/distiller/filmrollen/out/";
paths.rolleSaved = PCROOT + "/distiller/filmrollen/saved/";

paths.sc = ADOBESCRIPTS + "/";
paths.scriptsBT = ADOBESCRIPTS + "/bridgeTalk/";
paths.scriptsInc = ADOBESCRIPTS + "/includes/";
paths.scriptsIllu = ADOBESCRIPTS + "/illustrator/";
paths.scriptsIndd = ADOBESCRIPTS + "/indesign/";
paths.pantones = ADOBESCRIPTS + "/pantones.txt";
paths.scriptsPs = ADOBESCRIPTS + "/photoshop/";

paths.kd = CSROOT + "/kundendaten/";
paths.b2b = CSROOT + "/kundendaten/B2B/";
paths.b2c = CSROOT + "/kundendaten/B2C/";

paths.dv = CSROOT + "/produktion/druckvorstufe/";
paths.rollenplanerCS = paths.dv + "/filmrollenplaner/";
paths.templates = paths.dv + "/scriptVorlagen/filme/";
paths.vorlagen = paths.dv + "/scriptVorlagen/filme/";
paths.mock = paths.dv + "/scriptVorlagen/ansicht/";
paths.mockShirtMaster = paths.dv + "/scriptVorlagen/ansicht/shirts/Ansicht_Shirt_Master_cc2018.indd";
paths.mockBagMaster = paths.dv + "/scriptVorlagen/ansicht/taschen/Ansicht_Taschen_Master_cc2018.indd";

paths.client_folder = "../";
paths.job_folder = "./";
paths.ansicht = "./Ansicht/";
paths.previews = "./Previews/";
paths.filmdaten = "./Druckdaten-SD/";
paths.druckdaten = "./Druckdaten-SD/";
paths.ddSD = "./Druckdaten-SD/";
paths.ddDTA = "./Druckdaten-DTA/";
paths.ddDTAK = "./Druckdaten-DTA/";
paths.ddDTAX = "./Druckdaten-DTA/";
paths.ddDTG = "./Druckdaten-DTG/";
paths.ddFLO = "./Druckdaten-FLO/";
paths.ddFLX = "./Druckdaten-FLX/";
paths.ddSTK = "./Druckdaten-STK/";
paths.ddSUB = "./Druckdaten-SUB/";
paths.orga = "./Organisation/";
paths.working = "./Working/";

function set_paths(nfo) {
    varsSet = true;
    var p = paths;

    // Filetags
    p.printTag = nfo.printId + "_" + nfo.tech;

    p.docTag = nfo.jobNr ? nfo.jobNr + "_" + nfo.jobName : Window.prompt("Please enter a descriptive Jobname");

    // workingfiles
    p.workingAi = p.working + p.printTag + "_Working.ai";
    p.workingPs = p.working + p.printTag + "_Working.psd";
    p.workingEps = p.working + p.printTag + "_Working.eps";
    p.workingTif = p.working + p.printTag + "_Working.tif";
    p.backupPs = p.working + p.printTag + "_Backup.psd";
    p.backupAi = p.working + p.printTag + "_Backup.ai";
    p.previewAi = p.previews + p.printTag + "_Preview.ai";
    p.previewPs = p.previews + p.printTag + "_Preview.psd";
    p.previewEps = p.previews + p.printTag + "_Preview.eps";

    // druckdaten
    p.sdPrintAi = p.ddSD + p.printTag + "_Print.ai";
    p.sdPrintEps = p.ddSD + p.printTag + "_Print.eps";
    p.sdPrintPsd = p.ddSD + p.printTag + "_Print.psd";
    p.dtgPrintTif = p.ddDTG + p.printTag + "_Print.tif";
    p.dtaPrintPdf = p.ddDTA + p.printTag + "_Print.pdf";
    p.dtaxPrintPdf = p.ddDTA + p.printTag + "_Print.pdf";
    p.dtaoPrintPdf = p.ddDTA + p.printTag + "_Print.pdf";
    p.flxPrintAi = p.ddFLX + p.printTag + "_Print.ai";
    p.floPrintAi = p.ddFLO + p.printTag + "_Print.ai";
    p.dtgPrintTi = p.ddDTG + p.printTag + "_Print.tif";
    p.stkPrintAi = p.ddSTK + p.printTag + "_Print.ai";

    // filmdaten
    p.film = p.ddSD + p.docTag + "_" + p.printTag + "_Film.indd";
    p.filmPs = p.filmIn + p.docTag + "_" + p.printTag + "_Film.ps";
    p.filmPdf = p.filmOut + p.docTag + "_" + p.printTag + "_Film.pdf";

    // ansicht
    p.mockUpPdf = p.ansicht + p.docTag + "_Ansicht.pdf";
    p.mockUpIndd = p.ansicht + p.docTag + "_Ansicht.indd";
    p.mockUpDist = p.ansichtIn + p.docTag + "_Ansicht.ps";
    p.mockUpPostDist = p.ansichtOut + p.docTag + "_Ansicht.pdf";

    // organisation
    p.filmhuelle = p.ddSD + p.docTag + "_Filmhuelle.indd";
}

function get_path(shortHand) {
    //if (!varsSet) set_paths();
    if (Object.prototype.hasOwnProperty.call(paths, shortHand)) {
        return paths[shortHand];
    } else {
        return null;
    }
}

function create_containing_folder(myFile) {
    if (!myFile.parent.exists) {
        var containingFolder = new Folder(myFile.parent);
        containingFolder.create();
    }
}

function set_nfo(input) {
    if (input && input.folder && input.folder.constructor.name == "Folder") {
        Folder.current = input.folder;
    }

    nfo = f_all.copy_props(nfo, input, true);

    set_paths(nfo);
}

function folder(shortHand, nfoInput) {
    if (nfoInput) set_nfo(nfoInput);
    var resolved_path = get_path(shortHand);
    if (resolved_path) {
        return new Folder(resolved_path);
    } else {
        return null;
    }
}

function file(shortHand, nfoInput) {
    if (nfoInput) set_nfo(nfoInput);
    var resolved_path = get_path(shortHand);
    if (resolved_path) {
        var myFile = new File(resolved_path);
        create_containing_folder(myFile);
        return myFile;
    } else {
        return null;
    }
}

function path(shortHand, nfoInput) {
    if (nfoInput) set_nfo(nfoInput);
    return get_path(shortHand);
}

exports.folder = folder;
exports.path = path;
exports.file = file;
exports.set_nfo = set_nfo;
exports.pcroot = PCROOT;
exports.csroot = CSROOT;
