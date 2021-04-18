// check folder structure for jobNr
// check all jsonfiles if a json file contains the folder jobnr as referenzauftrag
// list found json files
// else list all jsonfiles with typeahead
// parse selected jsonfile and use job infos

//@include "require.js"
var typeahead = require("typeahead");
var ioFile = require("ioFile");

var jsonFolder = "/c/wawiscript/auftraginfos";
var jsonPattern = /.*\.json$/;

exports.load_json = function (jobNr) {
    var jsonFiles;
    if (jobNr) {
        jsonFiles = ioFile.get_files(jsonFolder, jobNr);
    } else {
        jsonFiles = ioFile.get_files(jsonFolder, jsonPattern);
    }

    if (jsonFiles.length === 1) {
        jsonFile = jsonFiles[0];
    } else {
        var result = typeahead.show_dialog(
            jsonFiles,
            "displayName",
            false,
            "Auftrag wählen:"
        );
        if (!result || result.length < 1) return;
        jsonFile = result[0];
    }

    var jobInfos = ioFile.import_json(jsonFile);
    return jobInfos;
};
