//@target indesign
//@include "require.js"

(function () {
    var job = require("job");
    var jobFolder = require("jobFolder");
    var f_id = require("f_id");

    var MonoMockup = require("MonoMockup");

    var interactSwitch = require("InteractionSwitch");
    interactSwitch.set("all");

    var jobNfo;
    if (app.documents.length > 0 && app.activeDocument) {
        jobNfo = job.get_jobNfo(app.activeDocument);
    } else {
        jobNfo = job.get_jobNfo();
    }

    jobFolder.set_folder(jobNfo.folder);

    var errors = [];

    var monoMockup = new MonoMockup(app.activeDocument);
    var layerToggle = f_id.layerToggle(["Intern"]);
    layerToggle.show();

    var monoGraphics = monoMockup.get_all_monoGraphics();

    var get_diff = function (fileInfos, previewInfos) {
        var difference = {};
        for (var key in fileInfos) {
            if (
                Object.hasOwnProperty.call(fileInfos, key) &&
                Object.hasOwnProperty.call(previewInfos, key)
            ) {
                difference[key] = (previewInfos[key] - fileInfos[key]).toFixed(0);
            }
        }
        return difference;
    };

    for (var k = 0; k < monoGraphics.length; k++) {
        var mG = monoGraphics[k];
        var fileInfos = mG.get_file_infos();
        if (!fileInfos) {
            errors.push({ mG: mG, result: { file: "file could not be checked" } });
            continue;
        }

        var previewInfos = mG.get_placement();
        var difference = get_diff(fileInfos, previewInfos);

        // if (
        //     Math.abs(difference.width) > 2 ||
        //     Math.abs(difference.height) > 2 ||
        //     Math.abs(difference.deltaX) > 1.5 ||
        //     Math.abs(difference.percentage) > 1
        // )
        // {
        errors.push({ mG: mG, result: difference });
        // }
    }

    if (errors.length == 0) {
        Window.alert("All ok, byebye!");
        return true;
    }

    var alertStr = "";
    for (var i = 0, len = errors.length; i < len; i++) {
        var e = errors[i];
        var diffs = e.result;
        alertStr += "Motiv ";
        alertStr += e.mG.get_fileName();
        alertStr += ":\r";

        for (var key in diffs) {
            if (!Object.hasOwnProperty.call(diffs, key)) continue;
            if (Math.abs(diffs[key]) < 1) continue; //if is 0 or contains ''

            alertStr += "Abweichung " + key + " -> " + diffs[key];
            alertStr += "\r";
        }
        alertStr += "\r";
    }

    //alertStr += "\rAbweichung ignorieren und weitermachen?";

    if (!Window.confirm(alertStr)) {
        return false;
    }

    interactSwitch.set("all");

    return true;
})();
