var rE = require("rE");
var f_all = require("f_all");
var names = require("names");
var print = {};

print.get_printNfo = function (target) {
    var printNfo = this.get_printNfo_from_filename(target);
    //if (!printNfo.printId || !printNfo.tech || !printNfo.jobName) {
    if (!printNfo.printId || !printNfo.tech) {
        var missingProps = [];
        if (!printNfo.printId) missingProps.push("printId");
        if (!printNfo.tech) missingProps.push("tech");
        //if (!printNfo.jobName) missingProps.push("jobName");
        var result = print.get_printNfo_from_user(missingProps);
        printNfo = f_all.copy_props(printNfo, result, true);
    }
    return printNfo;
};

print.get_printNfo_from_filename = function (target) {
    var printNfo = {};
    if (target.constructor.name === "File") {
        printNfo.file = target;
    }

    var fileName = target.displayName || target.name;
    var match;

    match = fileName.match(rE.printTag);
    if (match) {
        printNfo.printId = match[1];
        printNfo.tech = match[3];
    }

    match = fileName.match(rE.printTag2);
    if (match) {
        printNfo.printId = match[1];
        printNfo.tech = match[3];
    }

    return printNfo;
};

print.get_printNfo_from_user = function (propNames) {
    var n = names;
    var nfo = {};

    var techs = n.get_array("tech", true),
        ids = n.get_array("printId", true);
    //jobNames = get_jobNames(nfo.folder);

    var win = new Window("dialog", "monos Print Id Dialog");
    win.orientation = "column";
    win.alignChildren = "fill";

    win.pgrp = win.add("group", undefined, "");
    win.pgrp.orientation = "row";
    win.pgrp.alignChildren = "top";

    win.okgrp = win.add("group", undefined, "");
    win.okgrp.orientation = "row";
    win.okgrp.alignChildren = "fill";

    var helper = function (b) {
        return function () {
            if (this.value) {
                var value;
                if (this.parent.text == "Print_id") {
                    value = f_all.validateString(this.parent.opts[b]);
                    nfo.printId = value;
                } else if (this.parent.text == "Technique") {
                    value = f_all.validateString(this.parent.opts[b]);
                    nfo.tech = value;
                } else if (this.parent.text == "jobNames") {
                    value = f_all.validateString(this.parent.opts[b]);
                    add_nfo("jobName", value, true);
                }
            }
        };
    };

    if (propNames.includes("printId")) {
        ////////////////////////////////
        // add printId panel with radiobuttons and edittext
        win.pgrp.idpnl = win.pgrp.add("panel", undefined, "Print_id");
        var idpnl = win.pgrp.idpnl;
        idpnl.alignChildren = "fill";
        idpnl.opts = ids;

        for (var i = 0, maxI = ids.length; i < maxI; i += 1) {
            idpnl["rad_" + i] = idpnl.add(
                "radiobutton",
                undefined,
                n.name("printId", ids[i])
            );

            if (nfo.printId == ids[i]) {
                idpnl["rad_" + i].value = true;
            }
            idpnl["rad_" + i].onClick = helper(i);
        }

        idpnl.newid = idpnl.add("edittext", undefined, "Enter custom id:");
        idpnl.newid.onChange = function () {
            nfo.printId = this.text;
        };
    }

    if (propNames.includes("tech")) {
        /////////////////////////////////7
        // add technique panel with radiobuttons
        win.pgrp.techpnl = win.pgrp.add("panel", undefined, "Technique");
        var techpnl = win.pgrp.techpnl;
        techpnl.alignChildren = "fill";
        techpnl.opts = techs;

        for (var j = 0, maxJ = techs.length; j < maxJ; j += 1) {
            techpnl["rad_" + j] = techpnl.add(
                "radiobutton",
                undefined,
                n.name("tech", techs[j])
            );
            techpnl["rad_" + j].onClick = helper(j);
        }
    }

    if (propNames.includes("jobName")) {
        /////////////////////////////////////
        // add jobName panel with radio buttons and edittext
        win.pgrp.jobNamepnl = win.pgrp.add("panel", undefined, "jobNames");
        var jobNamepnl = win.pgrp.jobNamepnl;
        jobNamepnl.alignChildren = "fill";
        jobNamepnl.opts = jobNames;

        for (var i = 0, maxI = jobNames.length; i < maxI; i += 1) {
            jobNamepnl["rad_" + i] = jobNamepnl.add(
                "radiobutton",
                undefined,
                jobNames[i]
            );
            if (nfo.jobName == jobNames[i]) {
                jobNamepnl["rad_" + i].value = true;
            }
            jobNamepnl["rad_" + i].onClick = helper(i);
        }

        jobNamepnl.newjobName = jobNamepnl.add(
            "edittext",
            undefined,
            "New jobName:"
        );
        jobNamepnl.newjobName.onChange = function () {
            add_nfo("jobName", this.text, true);
        };
    }

    /////////////////////////////////////
    // OK Cancel
    win.okgrp.yes = win.okgrp.add("button", undefined, "Ok");
    win.okgrp.no = win.okgrp.add("button", undefined, "Abbrechen");

    win.okgrp.yes.onClick = function () {
        //if (nfo.printId && nfo.tech && nfo.jobName) {
        if (nfo.printId && nfo.tech) {
            win.close();
        } else {
            var alertString = "Diese Info(s) fehlen:\n";
            alertString += !nfo.printId ? "Druckposition\n" : "";
            alertString += !nfo.tech ? "Druckverfahren\n" : "";
            alertString += "bitte auswählen!";
            alert(alertString);
            return;
        }
    };

    win.okgrp.no.onClick = function () {
        win.close();
    };

    win.show();
    return nfo;
};

exports = module.exports = print;
