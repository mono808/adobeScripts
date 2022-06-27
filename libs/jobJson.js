//@include "require.js"
var typeahead = require("typeahead");
var ioFile = require("ioFile");

var jsonFolder = "/c/wawiscript/auftraginfos";
var jsonPattern = /.*\.json$/;

exports.load_json = function (jobNr) {
    var jsonFiles = ioFile.get_files(jsonFolder, jobNr || jsonPattern);

    if (jsonFiles.length > 1) {
        jsonFiles = typeahead.show_dialog(jsonFiles, "displayName", false, "Auftrag wählen:");
    }

    if (!jsonFiles || jsonFiles.length != 1) return;

    var jobInfos = ioFile.import_json(jsonFiles[0]);
    return jobInfos;
};
