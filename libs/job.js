var _ = require("_");
var refTool = require("refTool");
var jobJson = require("jobJson");
var jobNfoDialog = require("jobNfoDialog");
var recentFolders = require("recentFolders");
var rE = require("rE");
var csroot = Folder(CSROOT).fullName;

// TODO start with jsonfile, then only ask when job folder is not found

exports.get_jobNfo = function (doc) {
    var jobNfo = {};
    var result;

    //extract all infos that from filename and filepath
    result = exports.get_jobNfo_from_doc(doc);
    if (result) {
        jobNfo = _.copy_props(jobNfo, result, true);
    }

    // extract all infos from the json file
    result = exports.get_jobNfo_from_json(jobNfo.jobNr);
    if (result) {
        jobNfo = _.copy_props(jobNfo, result, true);
    }

    // let the user check the infos
    result = jobNfoDialog.show_dialog(jobNfo);
    if (!result) throw "Script Cancelled by YOU MOTHERFUCKER";
    jobNfo = _.copy_props(jobNfo, result, true);

    if (jobNfo.folder) {
        recentFolders.add(jobNfo.folder);
    }

    return jobNfo;
};

exports.get_jobNfo_from_doc = function (doc) {
    var jobNfo = {},
        refFile,
        result;

    if (!doc) return null;

    if (doc.constructor.name == "Document") {
        refFile = refTool.get_ref_from_doc(doc);
    } else if (doc.constructor.name == "File") {
        refFile = doc;
    }
    if (!refFile || refFile.constructor.name != "File") return null;

    result = get_jobNfo_from_file(refFile);
    jobNfo = _.copy_props(jobNfo, result, true);

    if (!jobNfo.jobNr && jobNfo.refNr) {
        jobNfo.jobNr = jobNfo.refNr;
    }

    return jobNfo;
};

exports.get_jobNfo_from_recentFolders = function () {
    var result;
    var jobNfo = {};
    //try to get a reference to a job from the activeDocument

    var recentFolder = recentFolders.show_dialog();

    if (!recentFolder.exists) return null;

    result = get_jobNfo_from_file(recentFolder);
    jobNfo = _.copy_props(jobNfo, result, true);

    if (!jobNfo.client) {
        // if starting with a recentFolder, the current jobNr cant reliably be obtained
        result = exports.get_jobNfo_from_json();
        jobNfo = _.copy_props(jobNfo, result, true);
    }

    return jobNfo;
};

exports.get_jobNfo_from_json = function (jobNr) {
    var jsonNfo = jobJson.load_json(jobNr);

    if (!jsonNfo) return null;

    var nfo = {};
    nfo.jobNr = jsonNfo.auftragsnummer;
    nfo.jobName = jsonNfo.jobname;
    nfo.client = jsonNfo.kunde.firma ? jsonNfo.kunde.firma : jsonNfo.kunde.name + " " + jsonNfo.kunde.vorname;

    var match = jsonNfo.auftragsnummer.match(/^\d{1,5}(a|cs|cn|eh|mt|wm)(21|22)(-\d\d\d)?/i);
    var year = Number(20 + match[2]);

    if (!jsonNfo.referenzauftrag && year >= 2021) {
        var jobPath = csroot + "/auftragsdaten/" + year + "/" + jsonNfo.auftragsnummer;
        nfo.folder = Folder(jobPath);
    }
    return nfo;
};

function get_jobNfo_from_file(aFile) {
    var jobNfo = {};
    if (aFile.constructor.name === "File") {
        jobNfo.file = aFile;
    }

    // check path for jobNr, can be old jobNr = refNr or current jobNr
    var match = aFile.path.match(rE.jobNr);
    if (match) {
        jobNfo.refNr = match[0];
    }

    // check filename for job infos, always contains the current jobNr
    match = aFile.name.match(rE.doc);
    if (match) {
        jobNfo.jobNr = match[1];
        jobNfo.jobName = match[3];
        jobNfo.doc = match[4];
    }

    var jobFolder = get_jobBaseFolder(aFile);
    if (!jobFolder) return null;
    Folder.current = jobFolder;

    var result;
    if (rE.jobNr2021.test(jobFolder.displayName)) {
        result = get_jobNfo_from_filepath_2021(jobFolder);
        jobNfo = _.copy_props(jobNfo, result, true);
    } else {
        result = get_jobNfo_from_filepath_pre2021(jobFolder);
        jobNfo = _.copy_props(jobNfo, result, true);
    }

    return jobNfo;
}

function get_jobNfo_from_filepath_pre2021(jobFolder) {
    var nfo = {};
    var match = jobFolder.displayName.match(rE.jobNameNew);
    match = match ? match : jobFolder.displayName.match(rE.jobNameOld);
    match = match ? match : jobFolder.displayName.match(rE.jobNr);

    nfo.refNr = match[1];
    nfo.shop = match[2].indexOf("wm") != -1 ? "wme" : "cs";
    nfo.jobName = match[3] ? match[3] : undefined;
    nfo.folder = jobFolder;
    nfo.client = jobFolder.parent.displayName;
    nfo.c2b = jobFolder.parent.parent.displayName;

    return nfo;
}

function get_jobNfo_from_filepath_2021(jobFolder) {
    var nfo = {};
    var match = jobFolder.displayName.match(rE.jobNr2021);

    nfo.refNr = match[0];
    nfo.shop = match[2].indexOf("wm") != -1 ? "wme" : "cs";
    nfo.folder = jobFolder;

    return nfo;
}

function get_jobBaseFolder(fld) {
    if (fld.displayName.match(rE.jobNr)) {
        return fld;
    } else if (fld.parent) {
        return get_jobBaseFolder(fld.parent);
    } else {
        return null;
    }
}
