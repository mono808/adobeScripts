//@target illustrator

(function () {
    /*
    Code for Import https://scriptui.joonas.me — (Triple click to select): 
    {"activeId":1,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":null,"windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Tiff Export","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"EditText","parentId":18,"style":{"enabled":true,"varName":null,"creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"150","justify":"left","preferredSize":[150,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Settings","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":"fill"}},"item-8":{"id":8,"type":"DropDownList","parentId":17,"style":{"enabled":true,"varName":null,"text":"DropDownList","listItems":"Item 1, -, Item 2","preferredSize":[150,0],"alignment":null,"selection":0,"helpTip":null}},"item-9":{"id":9,"type":"StaticText","parentId":17,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"AntiAliasing","justify":"left","preferredSize":[80,0],"alignment":null,"helpTip":null}},"item-13":{"id":13,"type":"DropDownList","parentId":19,"style":{"enabled":true,"varName":null,"text":"DropDownList","listItems":"Item 1, -, Item 2","preferredSize":[150,0],"alignment":null,"selection":0,"helpTip":null}},"item-14":{"id":14,"type":"StaticText","parentId":19,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Color Space","justify":"left","preferredSize":[80,0],"alignment":null,"helpTip":null}},"item-15":{"id":15,"type":"Checkbox","parentId":4,"style":{"enabled":true,"varName":null,"text":"embed ICC Profile","preferredSize":[0,0],"alignment":"left","helpTip":null}},"item-16":{"id":16,"type":"StaticText","parentId":18,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Resolution","justify":"left","preferredSize":[80,0],"alignment":null,"helpTip":null}},"item-17":{"id":17,"type":"Group","parentId":4,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-18":{"id":18,"type":"Group","parentId":4,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-19":{"id":19,"type":"Group","parentId":4,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-20":{"id":20,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["right","center"],"alignment":"right"}},"item-21":{"id":21,"type":"Button","parentId":20,"style":{"enabled":true,"varName":null,"text":"Cancel","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-22":{"id":22,"type":"Button","parentId":20,"style":{"enabled":true,"varName":null,"text":"Ok","justify":"center","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-23":{"id":23,"type":"Checkbox","parentId":4,"style":{"enabled":true,"varName":null,"text":"multiple Arboards","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,4,17,9,8,19,14,13,18,16,1,15,23,20,21,22],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
    */

    // DIALOG
    // ======
    var dialog = new Window("dialog");
    dialog.text = "Tiff Export";
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
    panel1.alignment = ["fill", "top"];

    // GROUP1
    // ======
    var group1 = panel1.add("group", undefined, { name: "group1" });
    group1.orientation = "row";
    group1.alignChildren = ["left", "center"];
    group1.spacing = 10;
    group1.margins = 0;

    var statictext1 = group1.add("statictext", undefined, undefined, { name: "statictext1" });
    statictext1.text = "AntiAliasing";
    statictext1.preferredSize.width = 80;

    var dropdown1_array = ["ARTOPTIMIZED", "NONE", "TYPEOPTIMIZED"];
    var dropdown1 = group1.add("dropdownlist", undefined, undefined, { name: "dropdown1", items: dropdown1_array });
    dropdown1.selection = 0;
    dropdown1.preferredSize.width = 150;

    // GROUP2
    // ======
    var group2 = panel1.add("group", undefined, { name: "group2" });
    group2.orientation = "row";
    group2.alignChildren = ["left", "center"];
    group2.spacing = 10;
    group2.margins = 0;

    var statictext2 = group2.add("statictext", undefined, undefined, { name: "statictext2" });
    statictext2.text = "Color Space";
    statictext2.preferredSize.width = 80;

    var dropdown2_array = ["CMYK", "RGB", "GrayScale"];
    var dropdown2 = group2.add("dropdownlist", undefined, undefined, { name: "dropdown2", items: dropdown2_array });
    dropdown2.selection = 0;
    dropdown2.preferredSize.width = 150;

    // GROUP3
    // ======
    var group3 = panel1.add("group", undefined, { name: "group3" });
    group3.orientation = "row";
    group3.alignChildren = ["left", "top"];
    group3.spacing = 10;
    group3.margins = 0;
    group3.alignment = ["fill", "top"];

    var slider2 = group3.add("slider", undefined, undefined, undefined, undefined, { name: "slider2" });
    slider2.helpTip = "Scale";
    slider2.minvalue = 16;
    slider2.maxvalue = 512;
    slider2.value = 160;
    slider2.preferredSize.width = 190;
    slider2.alignment = ["left", "fill"];

    var edittext2 = group3.add('edittext {properties: {name: "edittext2"}}');
    edittext2.text = "160";
    edittext2.preferredSize.width = 40;

    slider2.addEventListener("changing", function (e) {
        var rounded = Math.round(e.target.value / 16) * 16;
        edittext2.text = slider2.value = rounded;
    });
    edittext2.addEventListener("keyup", function (e) {
        slider2.value = Math.round(Number(e.target.text));
    });

    // PANEL1
    // ======
    var checkbox1 = panel1.add("checkbox", undefined, undefined, { name: "checkbox1" });
    checkbox1.text = "embed ICC Profile";

    var checkbox3 = panel1.add("checkbox", undefined, undefined, { name: "checkbox3" });
    checkbox3.text = "IZW Compression";

    var checkbox2 = panel1.add("checkbox", undefined, undefined, { name: "checkbox2" });
    checkbox2.text = "multiple Arboards";

    // GROUP4
    // ======
    var group4 = dialog.add("group", undefined, { name: "group4" });
    group4.orientation = "row";
    group4.alignChildren = ["right", "center"];
    group4.spacing = 10;
    group4.margins = 0;
    group4.alignment = ["right", "top"];

    var button1 = group4.add("button", undefined, undefined, { name: "Cancel" });
    button1.text = "Cancel";
    var button2 = group4.add("button", undefined, undefined, { name: "Ok" });
    button2.text = "Ok";

    if (dialog.show() == 2) {
        dialog.close();
        return null;
    }

    var doc = app.activeDocument;
    var fsName = doc.fullName.fsName;
    var extension = fsName.substring(fsName.lastIndexOf("."), fsName.length);
    var exportFile = fsName.replace(extension, ".tif");

    var e = new ExportOptionsTIFF();
    e.antiAliasing = eval("AntiAliasingMethod." + dropdown1.selection.text);
    e.embedICCProfile = checkbox1.value;
    e.imageColorSpace = eval("ImageColorSpace." + dropdown2.selection.text);
    e.resolution = Number(edittext2.text);
    e.IZWCompression = checkbox3.value;
    e.saveMultipleArtboards = checkbox2.value;

    doc.exportFile(File(exportFile), ExportType.TIFF, e);
})();
