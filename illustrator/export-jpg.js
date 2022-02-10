(function () {
    /*
    Code for Import https://scriptui.joonas.me — (Triple click to select): 
    {"activeId":4,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":null,"windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"JPG Export","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Settings","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["fill","top"],"alignment":null}},"item-2":{"id":2,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":null,"text":"AntiAliasing","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Checkbox","parentId":1,"style":{"enabled":true,"varName":null,"text":"Artboard Clipping","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Slider","parentId":13,"style":{"enabled":true,"varName":null,"preferredSize":[100,0],"alignment":null,"helpTip":"Quality (0-100)"}},"item-5":{"id":5,"type":"Slider","parentId":14,"style":{"enabled":true,"varName":null,"preferredSize":[100,0],"alignment":"fill","helpTip":"Scale"}},"item-6":{"id":6,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"JPG Quality","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-8":{"id":8,"type":"Divider","parentId":1,"style":{"enabled":true,"varName":null}},"item-9":{"id":9,"type":"Divider","parentId":1,"style":{"enabled":true,"varName":null}},"item-13":{"id":13,"type":"Group","parentId":1,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-14":{"id":14,"type":"Group","parentId":1,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","top"],"alignment":"fill"}},"item-16":{"id":16,"type":"EditText","parentId":13,"style":{"enabled":true,"varName":null,"creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"80\n","justify":"left","preferredSize":[35,0],"alignment":null,"helpTip":null}},"item-17":{"id":17,"type":"EditText","parentId":14,"style":{"enabled":true,"varName":null,"creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"100\n","justify":"left","preferredSize":[35,0],"alignment":null,"helpTip":null}},"item-18":{"id":18,"type":"StaticText","parentId":1,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Scale","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-19":{"id":19,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-20":{"id":20,"type":"Button","parentId":19,"style":{"enabled":true,"varName":null,"text":"Cancel","justify":"center","preferredSize":[75,0],"alignment":null,"helpTip":null}},"item-21":{"id":21,"type":"Button","parentId":19,"style":{"enabled":true,"varName":null,"text":"Ok","justify":"center","preferredSize":[75,0],"alignment":null,"helpTip":null}}},"order":[0,1,2,3,8,6,13,4,16,9,18,14,5,17,19,20,21],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
    */

    // DIALOG
    // ======
    var dialog = new Window("dialog");
    dialog.text = "JPG Export";
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

    var checkbox1 = panel1.add("checkbox", undefined, undefined, { name: "checkbox1" });
    checkbox1.text = "AntiAliasing";

    var checkbox2 = panel1.add("checkbox", undefined, undefined, { name: "checkbox2" });
    checkbox2.text = "Clip To Artboard";

    var divider1 = panel1.add("panel", undefined, undefined, { name: "divider1" });
    divider1.alignment = "fill";

    var statictext1 = panel1.add("statictext", undefined, undefined, { name: "statictext1" });
    statictext1.text = "JPG Quality";

    // GROUP1
    // ======
    var group1 = panel1.add("group", undefined, { name: "group1" });
    group1.orientation = "row";
    group1.alignChildren = ["left", "center"];
    group1.spacing = 10;
    group1.margins = 0;

    var slider1 = group1.add("slider", undefined, undefined, undefined, undefined, { name: "slider1" });
    slider1.helpTip = "Quality (0-100)";
    slider1.minvalue = 0;
    slider1.maxvalue = 100;
    slider1.value = 80;
    slider1.preferredSize.width = 100;

    var edittext1 = group1.add('edittext {properties: {name: "edittext1"}}');
    edittext1.text = "80";
    edittext1.preferredSize.width = 35;

    slider1.addEventListener("changing", function (e) {
        edittext1.text = Math.round(e.target.value / 5) * 5;
    });
    edittext1.addEventListener("keyup", function (e) {
        slider1.value = Math.round(Number(e.target.text));
    });

    // PANEL1
    // ======
    var divider2 = panel1.add("panel", undefined, undefined, { name: "divider2" });
    divider2.alignment = "fill";

    var statictext2 = panel1.add("statictext", undefined, undefined, { name: "statictext2" });
    statictext2.text = "Scale";

    // GROUP2
    // ======
    var group2 = panel1.add("group", undefined, { name: "group2" });
    group2.orientation = "row";
    group2.alignChildren = ["left", "top"];
    group2.spacing = 10;
    group2.margins = 0;
    group2.alignment = ["fill", "top"];

    var slider2 = group2.add("slider", undefined, undefined, undefined, undefined, { name: "slider2" });
    slider2.helpTip = "Scale";
    slider2.minvalue = 10;
    slider2.maxvalue = 300;
    slider2.value = 100;
    slider2.preferredSize.width = 100;
    slider2.alignment = ["left", "fill"];

    var edittext2 = group2.add('edittext {properties: {name: "edittext2"}}');
    edittext2.text = "100";
    edittext2.preferredSize.width = 35;

    slider2.addEventListener("changing", function (e) {
        edittext2.text = Math.round(e.target.value / 10) * 10;
    });
    edittext2.addEventListener("keyup", function (e) {
        slider2.value = Math.round(Number(e.target.text));
    });

    // PANEL1
    // ======
    var divider3 = panel1.add("panel", undefined, undefined, { name: "divider3" });
    divider3.alignment = "fill";

    // GROUP3
    // ======
    var group3 = panel1.add("group", undefined, { name: "group3" });
    group3.orientation = "row";
    group3.alignChildren = ["left", "center"];
    group3.spacing = 10;
    group3.margins = 0;

    var statictext3 = group3.add("statictext", undefined, undefined, { name: "statictext3" });
    statictext3.text = "Matte";

    var dropdown1_array = ["None", "White", "Black", "Grey"];
    var dropdown1 = group3.add("dropdownlist", undefined, undefined, { name: "dropdown1", items: dropdown1_array });
    dropdown1.selection = 0;
    dropdown1.preferredSize.width = 100;

    // GROUP4
    // ======
    var group4 = dialog.add("group", undefined, { name: "group4" });
    group4.orientation = "row";
    group4.alignChildren = ["left", "center"];
    group4.spacing = 10;
    group4.margins = 0;

    var button1 = group4.add("button", undefined, undefined, { name: "button1" });
    button1.text = "Cancel";
    button1.preferredSize.width = 75;

    var button2 = group4.add("button", undefined, undefined, { name: "button2" });
    button2.text = "Ok";
    button2.preferredSize.width = 75;

    if (dialog.show() == 2) {
        dialog.close();
        return null;
    }

    var doc = app.activeDocument;
    var fsName = doc.fullName.fsName;
    var extension = fsName.substring(fsName.lastIndexOf("."), fsName.length);
    var exportFile = fsName.replace(extension, ".jpg");

    var Grey = new RGBColor();
    Grey.red = 127;
    Grey.green = 127;
    Grey.blue = 127;

    var Black = new RGBColor();
    Black.red = 0;
    Black.green = 0;
    Black.blue = 0;

    var White = new RGBColor();
    White.red = 255;
    White.green = 255;
    White.blue = 255;

    var jpgOpts = new ExportOptionsJPEG();
    jpgOpts.antiAliasing = checkbox1.value;
    jpgOpts.artBoardClipping = checkbox2.value;
    jpgOpts.qualitySetting = Number(edittext1.text);
    jpgOpts.horizontalScale = Number(edittext2.text);
    jpgOpts.verticalScale = slider2.value;

    var useMatte = dropdown1.selection.text !== "None";
    if (useMatte) {
        jpgOpts.matte = useMatte;
        jpgOpts.matteColor = eval(dropdown1.selection.text);
    }

    doc.exportFile(File(exportFile), ExportType.JPEG, jpgOpts);
})();
