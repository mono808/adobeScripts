// testing git stuff
var rE = require("rE");
var jobRE = rE.jobNr;
var MonoPrint = require("MonoPrint");

var jobFolder;
var base;
var printFolders;
var ansichtenFolder;
var druckdatenSD;
var monoPrints = [];

function get_jobFolder(fld) {
    if (fld.displayName.match(jobRE)) {
        return fld;
    } else if (fld.parent) {
        return get_jobFolder(fld.parent);
    } else {
        return null;
    }
}
function get_folder(folderName) {
    var myFolder = new Folder(base.fullName + "/" + folderName);
    if (!myFolder.exists) myFolder.create();
    return myFolder;
}

function get_monoPrints(fld) {
    var prints = fld.getFiles(is_print);
    var result = [];
    for (var i = 0; i < prints.length; i++) {
        var mP = new MonoPrint(prints[i], base);
        monoPrints.push(mP);
    }
}

function get_docs() {}

function is_file(a) {
    return a instanceof File;
}

function is_folder(a) {
    return a instanceof Folder;
}

function is_print(a) {
    var fileName = a.displayName;
    if (!is_file(a)) return false;
    if (fileName.match(/.?(\.(ai|psd|tif|eps|pdf))$/gi)) {
        return true;
    }
    return false;
}

function is_printFolder(a) {
    if (!is_folder(a)) return false;
    return a.displayName.toLowerCase().indexOf("druckdaten") > -1;
}

function set_folder(folder) {
    jobFolder = get_jobFolder(folder);
    base = jobFolder ? jobFolder : folder;

    printFolders = base.getFiles(is_printFolder);
    ansichtenFolder = new Folder(base + "/ansicht");
    druckdatenSD = new Folder(base + "/druckdaten-sd");

    for (var i = 0; i < printFolders.length; i++) {
        get_monoPrints(printFolders[i]);
    }
}

function get_files(folderName) {
    var filesArray;
    if (subFolder.hasOwnProperty(folderName)) {
        filesArray = subFolders[folderName].getFiles(is_file);
    } else {
        filesArray = [];
    }
    return filesArray;
}

function get_prints() {
    return monoPrints;
}

function get_mockups() {
    return ansichtenFolder.getFiles("*Ansicht*.indd");
}

function get_filmhuelle() {
    return druckdatenSD.getFiles("*ilmhuelle.indd");
}

function get_filme() {
    return druckdatenSD.getFiles("*_Film.indd");
}

exports.set_folder = set_folder;
exports.get_files = get_files;
exports.get_prints = get_prints;
exports.get_mockups = get_mockups;
exports.get_filmhuelle = get_filmhuelle;
exports.get_filme = get_filme;
