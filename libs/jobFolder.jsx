// testing git stuff

var MonoPrint = require('MonoPrint');
var rE = require('rE');

var jobFolder;
var base;
var jobRE = rE.jobNr;///\d{1,5}(wme|ang|cs|a)\d\d-0\d\d/i;

var printFolders;
var ansichtenFolder;
var druckdatenSD;

var monoPrints = [];

function get_jobFolder (fld) {
    if(fld.displayName.match(jobRE)) {
        return fld;
    } else if (fld.parent) {
        return set_jobFolder(fld.parent);
    } else {
        return null;
    }
};

function get_folder (folderName) {
    var myFolder = new Folder(base.fullName + '/' + folderName);
    if(!myFolder.exists) myFolder.create();
    return myFolder;
};

function get_monoPrints (fld) {
    var prints = fld.getFiles(is_print);
    var result = [];
    for (var i = 0; i < prints.length; i++) {
        var mP = new MonoPrint(prints[i], base);
        monoPrints.push(mP);
    }
};

function get_docs () {

};

function is_file (a) {
    return a instanceof File;
};

function is_folder (a) {
    return a instanceof Folder;
};	

function is_print (a) {
    var fileName = a.displayName;
    if(!is_file(a)) return false;
    if(fileName.match(/.?(\.(ai|psd|tif|eps|pdf))$/ig)) {
        return true;
    }
    return false;
};

function is_printFolder (a) {
    if(!is_folder(a)) return false;
    return (a.displayName.toLowerCase().indexOf('druckdaten') > -1);
}

exports.set_folder = function  (aFolder) {

    jobFolder = get_jobFolder(aFolder);
    base = jobFolder ? jobFolder : aFolder;

    printFolders = base.getFiles(is_printFolder);
    ansichtenFolder = new Folder(base + '/ansicht');
    druckdatenSD = new Folder(base + '/druckdaten-sd');
    
    for (var i = 0; i < printFolders.length; i++) {
        get_monoPrints(printFolders[i]);
    }
}

exports.get_files = function (folderName) {
    var filesArray;
    if(subFolder.hasOwnProperty(folderName)) {
        filesArray = subFolders[folderName].getFiles(is_file);
    } else {			
        filesArray = [];
    }
    return filesArray;
};

exports.get_prints = function () {
    return monoPrints;
};

exports.get_mockups = function () {
    return ansichtenFolder.getFiles('*Ansicht*.indd');
};

exports.get_filmhuelle = function () {
    return druckdatenSD.getFiles('*ilmhuelle.indd');
};

exports.get_filme = function () {
    return druckdatenSD.getFiles('*_Film.indd');
};

