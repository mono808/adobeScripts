//@target illustrator

(function () {
    // DIALOG
    // ======
    var dialog = new Window("dialog");
    dialog.text = "Export for Screens JPG";
    dialog.orientation = "column";
    dialog.alignChildren = ["center", "top"];
    dialog.spacing = 10;
    dialog.margins = 16;

    // PANEL1
    // ======
    var panel1 = dialog.add("panel", undefined, undefined, { name: "panel1" });
    panel1.text = "Settings";
    panel1.orientation = "column";
    panel1.alignChildren = ["fill", "top"];
    panel1.spacing = 10;
    panel1.margins = 10;

    // GROUP1
    // ======
    var group1 = panel1.add("group", undefined, { name: "group1" });
    group1.orientation = "row";
    group1.alignChildren = ["left", "center"];
    group1.spacing = 10;
    group1.margins = 0;

    var statictext1 = group1.add("statictext", undefined, undefined, { name: "statictext1" });
    statictext1.text = "Anti Aliasing";
    statictext1.preferredSize.width = 85;

    var dropdownAA_array = ["ARTOPTIMIZED", "None", "TYPEOPTIMIZED"];
    var dropdownAA = group1.add("dropdownlist", undefined, undefined, { name: "dropdownAA", items: dropdownAA_array });
    dropdownAA.selection = 0;
    dropdownAA.preferredSize.width = 180;

    // GROUP2
    // ======
    var group2 = panel1.add("group", undefined, { name: "group2" });
    group2.orientation = "row";
    group2.alignChildren = ["left", "center"];
    group2.spacing = 10;
    group2.margins = 0;

    var statictext2 = group2.add("statictext", undefined, undefined, { name: "statictext2" });
    statictext2.text = "Compression";
    statictext2.preferredSize.width = 85;

    var dropdownComp_array = ["BASELINEOPTIMIZED", "BASELINESTANDARD", "PROGRESSIV"];
    var dropdownComp = group2.add("dropdownlist", undefined, undefined, { name: "dropdownComp", items: dropdownComp_array });
    dropdownComp.selection = 0;
    dropdownComp.preferredSize.width = 180;

    // GROUP3
    // ======
    var group3 = panel1.add("group", undefined, { name: "group3" });
    group3.orientation = "row";
    group3.alignChildren = ["left", "center"];
    group3.spacing = 10;
    group3.margins = 0;

    var statictext3 = group3.add("statictext", undefined, undefined, { name: "statictext3" });
    statictext3.text = "Scale By";
    statictext3.preferredSize.width = 85;

    var dropdownScale_array = ["FACTOR", "WIDTH", "HEIGHT", "RESOLUTION"];
    var dropdownScale = group3.add("dropdownlist", undefined, undefined, { name: "dropdownScale", items: dropdownScale_array });
    dropdownScale.selection = 0;

    var edittextScale = group3.add('edittext {properties: {name: "edittextScale"}}');
    edittextScale.text = "1";
    edittextScale.preferredSize.width = 35;

    var statictextScale = group3.add("statictext", undefined, undefined, { name: "statictextScale" });
    statictextScale.text = "";
    statictextScale.preferredSize.width = 20;

    dropdownScale.addEventListener("change", function (e) {
        statictextScale.text = e.target.selection.text === "FACTOR" ? "" : "px";
    });

    // PANEL1
    // ======
    var checkboxICC = panel1.add("checkbox", undefined, undefined, { name: "checkboxICC" });
    checkboxICC.text = "Embed ICC Profile";

    // GROUP4
    // ======
    var group4 = dialog.add("group", undefined, { name: "group4" });
    group4.orientation = "row";
    group4.alignChildren = ["left", "center"];
    group4.spacing = 10;
    group4.margins = 0;

    var button1 = group4.add("button", undefined, undefined, { name: "button1" });
    button1.text = "Cancel";

    var button2 = group4.add("button", undefined, undefined, { name: "button2" });
    button2.text = "Ok";
    button2.preferredSize.width = 74;

    if (dialog.show() == 2) {
        dialog.close();
        return null;
    }

    var doc = app.activeDocument;
    var exportFolder = doc.fullName.parent;
    var exportFormat = ExportForScreensType.SE_JPEG80;
    var item = new ExportForScreensItemToExport();
    item.document = true;
    item.artboards = "";
    var prefix = "";

    var opts = new ExportForScreensOptionsJPEG();
    opts.antiAliasing = eval("AntiAliasingMethod." + dropdownAA.selection.text);
    opts.compressionMethod = eval("JPEGCompressionMethodType." + dropdownComp.selection.text);
    opts.embedICCProfile = checkboxICC.value;
    opts.scaleType = eval("ExportForScreensScaleType.SCALEBY" + dropdownScale.selection.text);
    opts.scaleTypeValue = Number(edittextScale.text);

    doc.exportForScreens(exportFolder, exportFormat, opts, item, prefix);
})();
