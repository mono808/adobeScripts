// testing git stuff
<<<<<<< HEAD

var MonoPrint = require('MonoPrint');
var rE = require('rE');

var jobFolder;
var base;
var jobRE = rE.jobNr;///\d{1,5}(wme|ang|cs|a)\d\d-0\d\d/i;

=======
var rE = require('rE');
var jobRE = rE.jobNr; ///\d{1,5}(wme|ang|cs|a)\d\d-0\d\d/i;
var MonoPrint = require('MonoPrint');

var jobFolder;
var base;
>>>>>>> refs/remotes/origin/idModules
var printFolders;
var ansichtenFolder;
var druckdatenSD;

var monoPrints = [];

function get_jobFolder (fld) {
    if(fld.displayName.match(jobRE)) {
        return fld;
    } else if (fld.parent) {
<<<<<<< HEAD
        return set_jobFolder(fld.parent);
    } else {
        return null;
    }
};

=======
        return get_jobFolder(fld.parent);
    } else {
        return null;
    }
}
>>>>>>> refs/remotes/origin/idModules
function get_folder (folderName) {
    var myFolder = new Folder(base.fullName + '/' + folderName);
    if(!myFolder.exists) myFolder.create();
    return myFolder;
<<<<<<< HEAD
};
=======
}
>>>>>>> refs/remotes/origin/idModules

function get_monoPrints (fld) {
    var prints = fld.getFiles(is_print);
    var result = [];
    for (var i = 0; i < prints.length; i++) {
        var mP = new MonoPrint(prints[i], base);
        monoPrints.push(mP);
    }
<<<<<<< HEAD
};

function get_docs () {

};

function is_file (a) {
    return a instanceof File;
};

function is_folder (a) {
    return a instanceof Folder;
};	
=======
}

function get_docs () {

}

function is_file (a) {
    return a instanceof File;
}

function is_folder (a) {
    return a instanceof Folder;
}	
>>>>>>> refs/remotes/origin/idModules

function is_print (a) {
    var fileName = a.displayName;
    if(!is_file(a)) return false;
    if(fileName.match(/.?(\.(ai|psd|tif|eps|pdf))$/ig)) {
        return true;
    }
    return false;
<<<<<<< HEAD
};
=======
}
>>>>>>> refs/remotes/origin/idModules

function is_printFolder (a) {
    if(!is_folder(a)) return false;
    return (a.displayName.toLowerCase().indexOf('druckdaten') > -1);
}

<<<<<<< HEAD
exports.set_folder = function  (aFolder) {

    jobFolder = get_jobFolder(aFolder);
    base = jobFolder ? jobFolder : aFolder;
=======
function set_folder(folder) {

    jobFolder = get_jobFolder(folder);
    base = jobFolder ? jobFolder : folder;
>>>>>>> refs/remotes/origin/idModules

    printFolders = base.getFiles(is_printFolder);
    ansichtenFolder = new Folder(base + '/ansicht');
    druckdatenSD = new Folder(base + '/druckdaten-sd');
<<<<<<< HEAD
    
=======

    monoPrints = [];
>>>>>>> refs/remotes/origin/idModules
    for (var i = 0; i < printFolders.length; i++) {
        get_monoPrints(printFolders[i]);
    }
}

<<<<<<< HEAD
exports.get_files = function (folderName) {
=======
function get_files (folderName) {
>>>>>>> refs/remotes/origin/idModules
    var filesArray;
    if(subFolder.hasOwnProperty(folderName)) {
        filesArray = subFolders[folderName].getFiles(is_file);
    } else {			
        filesArray = [];
    }
    return filesArray;
<<<<<<< HEAD
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

=======
}

function get_prints () {
    return monoPrints;
}

function get_mockups () {
    return ansichtenFolder.getFiles('*Ansicht*.indd');
}

function get_filmhuelle () {
    return druckdatenSD.getFiles('*ilmhuelle.indd');
}

function get_filme () {
    return druckdatenSD.getFiles('*_Film.indd');
}

exports.set_folder = set_folder;
exports.get_files = get_files;
exports.get_prints = get_prints;
exports.get_mockups = get_mockups;
>>>>>>> refs/remotes/origin/idModules
