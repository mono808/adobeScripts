exports.show_dialog = function (preset) {
    // DIALOG
    // ======
    var dialog = new Window("dialog");
    dialog.text = "Job Infos";
    dialog.orientation = "column";
    dialog.alignChildren = ["right", "top"];
    dialog.spacing = 10;
    dialog.margins = 16;

    // JOBNRGRP
    // ========
    var jobNrGrp = dialog.add("group", undefined, { name: "jobNrGrp" });
    jobNrGrp.preferredSize.width = 280;
    jobNrGrp.orientation = "row";
    jobNrGrp.alignChildren = ["right", "center"];
    jobNrGrp.spacing = 10;
    jobNrGrp.margins = 0;

    var jobNrLabel = jobNrGrp.add("statictext", undefined, undefined, { name: "jobNrLabel" });
    jobNrLabel.text = "Auftragsnr";

    var jobNrEdit = jobNrGrp.add('edittext {properties: {name: "jobNrEdit"}}');
    jobNrEdit.text = preset.jobNr || "???";
    jobNrEdit.preferredSize.width = 200;

    // JOBNAMEGRP
    // ==========
    var jobNameGrp = dialog.add("group", undefined, { name: "jobNameGrp" });
    jobNameGrp.orientation = "row";
    jobNameGrp.alignChildren = ["left", "center"];
    jobNameGrp.spacing = 10;
    jobNameGrp.margins = 0;

    var jobNameLabel = jobNameGrp.add("statictext", undefined, undefined, { name: "jobNameLabel" });
    jobNameLabel.text = "Motiv";

    var jobNameEdit = jobNameGrp.add('edittext {properties: {name: "jobNameEdit"}}');
    jobNameEdit.text = preset.jobName || "???";
    jobNameEdit.preferredSize.width = 200;

    // CLIENTGRP
    // =========
    var clientGrp = dialog.add("group", undefined, { name: "clientGrp" });
    clientGrp.preferredSize.width = 280;
    clientGrp.orientation = "row";
    clientGrp.alignChildren = ["right", "center"];
    clientGrp.spacing = 10;
    clientGrp.margins = 0;

    var clientLabel = clientGrp.add("statictext", undefined, undefined, { name: "clientLabel" });
    clientLabel.text = "Kunde";
    clientLabel.alignment = ["right", "center"];

    var clientEdit = clientGrp.add('edittext {properties: {name: "clientEdit"}}');
    clientEdit.text = preset.client || "???";
    clientEdit.preferredSize.width = 200;

    // FOLDERGRP
    // =========
    var folderGrp = dialog.add("group", undefined, { name: "folderGrp" });
    folderGrp.orientation = "row";
    folderGrp.alignChildren = ["left", "center"];
    folderGrp.spacing = 10;
    folderGrp.margins = 0;

    var folderLabel = folderGrp.add("statictext", undefined, undefined, { name: "folderLabel" });
    folderLabel.text = "Verzeichnis";

    var folderName = folderGrp.add("statictext", undefined, undefined, { name: "folderName" });
    folderName.text = (preset.folder && preset.folder.displayName) ? preset.folder.displayName : "jetzt suchen...";
    folderName.helpTip = (preset.folder && preset.folder.fsName) ? preset.folder.fsName : "test";
    folderName.folder = preset.folder || null;
    folderName.preferredSize.width = 200;

    // DIALOG
    // ======
    var divider1 = dialog.add("panel", undefined, undefined, { name: "divider1" });
    divider1.alignment = "fill";

    // OKGRP
    // =====
    var okGrp = dialog.add("group", undefined, { name: "okGrp" });
    okGrp.orientation = "row";
    okGrp.alignChildren = ["center", "center"];
    okGrp.spacing = 10;
    okGrp.margins = 0;

    var ok = okGrp.add("button", undefined, undefined, { name: "ok" });
    ok.text = "Ok";
    ok.preferredSize.width = 80;

    var cancel = okGrp.add("button", undefined, undefined, { name: "cancel" });
    cancel.text = "Cancel";
    cancel.preferredSize.width = 80;

    folderName.addEventListener("click", function (e) {
        var t = e.target;
        var folder = new Folder(CSROOT + "/Auftragsdaten/2022/").selectDlg();
        if (!folder || !folder.exists) return;
        t.text = folder.displayName;
        t.helpTip = folder.fsName;
        t.folder = folder;
    });

    if (dialog.show() == 2) {
        dialog.close();
        return null;
    }

    var result = {
        jobNr: jobNrEdit.text,
        jobName: jobNameEdit.text,
        client: clientEdit.text,
        folder: folderName.folder
    };
    return result;
}
