//@include "require.js"
//@targetengine "session"

var ioFile = require("ioFile");
var importFolder = "/c/wawiscript/auftraginfos/";

function positionen_hinweis(jsonObj, newLine) {
    var aString = "";

    jsonObj.positionen.forEach(function (pos) {
        if (pos.hinweis != "") {
            aString += pos.artikelnummer + newLine;
            aString += pos.hinweis + newLine;
        }
    });

    return aString;
}

function kunde(jsonObj, newLine) {
    var aString = "";
    if (jsonObj.kunde.firma != "") {
        aString += jsonObj.kunde.firma;
        aString += newLine;
    }
    if (jsonObj.kunde.name != "") {
        aString += jsonObj.kunde.name + " " + jsonObj.kunde.vorname;
        aString += newLine;
    }
    aString += jsonObj.auftragsnummer + "_" + jsonObj.jobname;
    return aString;
}

function anmerkungen(jsonObj, newLine) {
    var aString = "";
    jsonObj.anmerkungen.forEach(function (anm) {
        aString += anm;
        aString += newLine;
    });
    return aString;
}

function positionen(jsonObj, newLine) {
    var aString = "";
    jsonObj.positionen.forEach(function (pos) {
        aString += pos.menge + "x " + pos.artikelnummer + " " + pos.bezeichnung;
        aString += newLine;
        if (pos.hinweis != "") {
            aString += "Hinweis: " + pos.hinweis + newLine;
        }
        aString += newLine;
    });
    return aString;
}

function add_text_block(acc, title, content) {
    if (content && content != "") {
        acc += title + ":\n";
        acc += content;
        acc += "\n";
        acc += "\n";
    }
    return acc;
}

function add_html_block(acc, title, content) {
    if (content && content != "") {
        acc += "<h2>" + title + "</h2>";
        acc += "<p>";
        acc += content;
        acc += "</p>";
    }
    return acc;
}

function create_content(jsonObj, contentType) {
    var content = "";
    var accuFunc = contentType == "html" ? add_html_block : add_text_block;
    var newLine = contentType == "html" ? "<br>" : "\n";

    content = accuFunc(content, "Kunde", kunde(jsonObj, newLine));
    content = accuFunc(
        content,
        "Hinweise aus Positionen",
        positionen_hinweis(jsonObj, newLine)
    );
    content = accuFunc(content, "Hinweis", jsonObj.hinweis);
    content = accuFunc(content, "Status", jsonObj.statuscontent);
    content = accuFunc(content, "Positionen", positionen(jsonObj, newLine));
    content = accuFunc(content, "Anmerkungen", anmerkungen(jsonObj, newLine));

    return content;
}

function trim_jobNr(jobNr) {
    while (jobNr.charAt(0) == "0") {
        jobNr = jobNr.slice(1, jobNr.length);
    }
    return jobNr;
}

function parse_json(jobNr) {
    var noLeadingZeroJobNr = trim_jobNr(jobNr);
    var jsonFile = new File(importFolder + "/" + noLeadingZeroJobNr + ".json");
    var jsonObj = ioFile.import_json(jsonFile);
    return jsonObj;
}

exports.get_info_text = function (jobNr) {
    var jsonObj = parse_json(jobNr);
    return create_content(jsonObj, "text");
};

exports.get_info_object = function (jobNr) {
    var jsonObj = parse_json(jobNr);
    return jsonObj;
};

exports.get_info_html = function (jobNr) {
    var jsonObj = parse_json(jobNr);
    if (jsonObj) {
        return create_content(jsonObj, "html");
    } else {
        return (
            "<p>JobInfo " +
            jobNr +
            " konnte nicht geladen werden.<br>Bitte Auftrag einmal in WAWI öffnen.<br>Bei Nachdruck Auftragsnummer manuell eingeben</p>"
        );
    }
};
