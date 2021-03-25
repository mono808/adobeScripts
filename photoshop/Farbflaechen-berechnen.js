//@target photoshop-60.064

//@include 'augment_objects.jsx'
//@include 'universal_functions.jsx'
//@include 'SepDocPS.jsx'
//@include 'AreaDialog.jsx'

function main() {
    baseDoc.doc = app.activeDocument;
    var sepDoc = Object.create(sepDocPS);
    sepDoc.startDoc = app.activeDocument;

    var report = sepDoc.get_histogram_reports(sepDoc);
    var totalArea = sepDoc.get_totalArea();

    //$.writeln('Totalfläche: ' + report.totalArea);
    var inkDialog = new AreaDialog(report, totalArea).create_win().show();
    //show_dialog(report);
}

main();

function check_ink_coverage(myDoc) {
    var oldUnits = app.preferences.rulerUnits;
    var report = {
        totalArea: myDoc.width.as("cm") * myDoc.height.as("cm"),
        spotChannels: [],
        allOneBit: true
    };

    app.preferences.rulerUnits = Units.PIXELS;

    for (var i = 0, maxI = myDoc.channels.length; i < maxI; i += 1) {
        var ch = myDoc.channels[i];
        if (ch.kind == ChannelType.SPOTCOLOR) {
            var chanRep = check_histogram(ch);
            if (!chanRep.isOneBit) {
                report.allOneBit = false;
            }
            report.spotChannels.push(chanRep);
        }
    }

    return report;
}

function show_dialog(report) {
    var textils = ["XT", "WM110", "Shirts"];

    // cm³ pro cm² druckfäche
    var vthTab = {
        32: 0.00721,
        43: 0.0053,
        48: 0.00475,
        54: 0.00398,
        61: 0.00304,
        77: 0.00233,
        90: 0.00192,
        120: 0.00163,
        140: 0.00106
    };

    // ink usage factor
    var texFactor = {
        XT: 1.5,
        WM110: 1.15,
        Shirts: 1.3
    };

    // kg per cm³ of ink
    var toKG = 4.5 / (3.79 * 1000);
    var toG = (4.5 * 1000) / (3.79 * 1000);

    function calc_all() {
        for (var i = 0; i < report.spotChannels.length; i++) {
            calculate(i);
        }
    }

    function calculate(i) {
        var nameTxt = nameGrp.children[i + 1];
        var area = report.spotChannels[i].area;
        var screenDrop = screenGrp.children[i + 1];
        var inkText = inkGrp.children[i + 1];
        var ubCheck = ubGrp.children[i + 1];
        var volume = vthTab[screenDrop.selection] * area;
        if (!ubCheck.value) {
            volume *= Number(texFactor[texDrop.selection]);
        }
        var totalVol = volume * Number(runEdit.text);
        var weight = totalVol * toG;
        inkText.text = weight.toFixed(0);
    }

    var retval = false;
    var w = new Window("dialog", "Farbverbrauch");
    w.orientation = "column";

    var jobPnl = w.add("panel");
    jobPnl.orientation = "row";

    var textilGrp = jobPnl.add("group");
    textilGrp.orientation = "column";
    textilGrp.add("statictext", undefined, "Textil:");

    var runGrp = jobPnl.add("group");
    runGrp.orientation = "column";
    runGrp.alignment = "fill";
    runGrp.add("statictext", undefined, "Auflage:");

    var texDrop = textilGrp.add("dropdownlist", undefined, "XT003");
    texDrop.preferredSize = [100, 20];
    for (var j in texFactor) {
        if (texFactor.propertyIsEnumerable(j)) {
            var item = texDrop.add("item", j);
        }
    }
    texDrop.selection = texDrop.items[0];
    texDrop.onChange = calc_all;

    var runEdit = runGrp.add("edittext", undefined, 50);
    runEdit.preferredSize = [60, 20];
    runEdit.onChange = calc_all;

    var tablePnl = w.add("panel");
    tablePnl.orientation = "row";
    tablePnl.alignment = "fill";

    var nameGrp = tablePnl.add("group");
    nameGrp.orientation = "column";
    nameGrp.alignChildren = "fill";
    nameGrp.add("statictext", undefined, "Farbe:");

    /*var bitGrp = tablePnl.add('group');*/
    /*bitGrp.orientation = 'column';*/
    /*bitGrp.alignChildren = 'fill';*/
    /*bitGrp.add('statictext',undefined, 'Vollton:');*/

    var areaGrp = tablePnl.add("group");
    areaGrp.orientation = "column";
    areaGrp.alignChildren = "fill";
    areaGrp.add("statictext", undefined, "Farbfläche:");

    var covGrp = tablePnl.add("group");
    covGrp.orientation = "column";
    covGrp.alignChildren = "fill";
    covGrp.add("statictext", undefined, "in %:");

    var ubGrp = tablePnl.add("group");
    ubGrp.orientation = "column";
    ubGrp.alignChildren = "fill";
    ubGrp.add("statictext", undefined, "Vordruck:");

    var screenGrp = tablePnl.add("group");
    screenGrp.orientation = "column";
    screenGrp.alignChildren = "fill";
    screenGrp.add("statictext", undefined, "Gewebe:");

    var inkGrp = tablePnl.add("group");
    inkGrp.orientation = "column";
    inkGrp.alignChildren = "right";
    inkGrp.add("statictext", undefined, "Verbrauch (g):");

    for (var i = 0; i < report.spotChannels.length; i += 1) {
        var spotChan = report.spotChannels[i];
        //if(!spotChan.isOneBit) allOneBit = false;

        var nameText = nameGrp.add("statictext", undefined, spotChan.name);
        nameText.preferredSize = [80, 25];

        var areaText = areaGrp.add(
            "statictext",
            undefined,
            spotChan.area.toFixed(1) + " cm²"
        );
        areaText.preferredSize = [70, 25];

        var covText = covGrp.add(
            "statictext",
            undefined,
            ((spotChan.area / report.totalArea) * 100).toFixed(0) + " %"
        );
        covText.preferredSize = [50, 25];

        var ubCheck = ubGrp.add("checkbox");
        ubCheck.myRow = Number(i);
        ubCheck.preferredSize = [45, 25];
        ubCheck.value = false;
        ubCheck.onClick = function () {
            calculate(this.myRow);
        };

        var screenDrop = screenGrp.add("dropdownlist");
        screenDrop.preferredSize = [45, 25];
        screenDrop.myRow = Number(i);

        for (var j in vthTab) {
            if (vthTab.propertyIsEnumerable(j)) {
                var item = screenDrop.add("item", j);
            }
        }
        screenDrop.selection = screenDrop.items[0];
        screenDrop.onChange = function () {
            calculate(this.myRow);
        };

        var volume =
            vthTab[screenDrop.selection] * spotChan.area * Number(runEdit.text);
        var inkText = inkGrp.add("statictext", undefined, 00);
        inkText.preferredSize = [40, 25];

        screenDrop.onChange();
    }

    var btnGrp = w.add("group");
    btnGrp.orientation = "row";
    var okBtn = btnGrp.add("button", undefined, "Ok");
    var cclBtn = btnGrp.add("button", undefined, "Cancel");
    okBtn.onClick = function () {
        retval = true;
        w.close();
    };
    cclBtn.onClick = function () {
        retval = false;
        w.close();
    };

    w.show();
    return retval;
}
