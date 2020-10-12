$.level = 1;

function AreaDialog (spotChans, totalArea) {
    this.vthTab = {
        32 : 0.00721,
        43 : 0.00530,
        48 : 0.00475,
        54 : 0.00398,
        61 : 0.00304,
        77 : 0.00233,
        90 : 0.00192,
        120 : 0.00163,
        140 : 0.00106
    };
    this.screenList = this.tab_to_list(this.vthTab);

    this.usageFactor = 3.2;
    
    this.rakelTab = {
        '1-1' : 1,
        '3-1' : 1.5,
        '2-2' : 2
    }
    this.rakelList = this.tab_to_list(this.rakelTab);

    // kg per cm³ of ink
    this.toKG = 4.5/(3.79*1000);
    this.toG = this.toKG*1000;

    this.windowName = "Farbrechner";
    this.win = null;
    this.spotChans = spotChans;
    this.totalArea = totalArea;
}

AreaDialog.prototype.tab_to_list = function (obj) 
{
    var list = [];
    for (var j in obj) {
        if(obj.propertyIsEnumerable(j)) {
            list.push(j);
        }
    };
    return list;
};

AreaDialog.prototype.create_win = function (windowName)
{
    var win = new Window("dialog");
    var that = this;
    win.text = windowName;
    win.orientation = 'column';

    win.calc_all = function () 
    {
        for (var i = 0; i < that.spotChans.length; i++) {
            this.calculate_line(i);
        }
    };

    win.calculate_line = function (i) 
    {
        var area = Math.abs(that.spotChans[i].area);
        var rakel = this.findElement("rakelDrop").selection.text;
        var run = Number(this.findElement("runEdit").text);
        var usage = Number(this.findElement("usageEdit").text);
        var screen = this.findElement ("screenDrop" + (i)).selection.text;
        var inkText = this.findElement ("inkText" + (i));
        var isUnderbased = this.findElement ("ubCheck" + (i)).value;       
        
        var volume = that.vthTab[screen] * area * Number(that.rakelTab[rakel]) * usage;
        var totalVol = volume * run;
        var weight = totalVol * that.toG;
        inkText.text = weight.toFixed(0);
    };

        var jobGrp = win.add("group");

            jobGrp.add("statictext {text:'Rakel:'}");
            var rakelDrop = jobGrp.add("dropdownlist", undefined, this.rakelList, {name:"rakelDrop"});
            rakelDrop.selection = rakelDrop.items[0];

            jobGrp.add("statictext {text:'Auflage:'}");
            var runEdit = jobGrp.add("edittext", undefined, 50, {name:"runEdit"});
            runEdit.preferredSize = [60,20];

            jobGrp.add("statictext {text:'Verbrauchs-Faktor:'}");
            var usageEdit = jobGrp.add("edittext", undefined, this.usageFactor, {name:"usageEdit"});
            runEdit.preferredSize = [60,20];

        var tablePnl = win.add("panel {orientation:'row', alignment:'fill'}");

            var nameGrp = tablePnl.add("group {orientation:'column', alignChildren:'left', preferredSize:[100,'']}");
            nameGrp.add("statictext {text:'Farbe', preferredSize:[-1,35]}");

            var areaGrp = tablePnl.add("group {orientation:'column', alignChildren:'fill', preferredSize:[70,-1]}");
            areaGrp.add("statictext {text:'Druckfläche', preferredSize:[-1,35]}");

            var covGrp = tablePnl.add("group {orientation:'column', alignChildren:'fill', preferredSize:[60,'']}");
            covGrp.add("statictext {text:'In %', preferredSize:[-1,35]}");

            var screenGrp = tablePnl.add("group {orientation:'column', alignChildren:'center', preferredSize:[45,'']}");
            screenGrp.add("statictext {text:'Gewebe', preferredSize:[-1,35]}");
            
            var ubGrp = tablePnl.add("group {orientation:'column', alignChildren:'center', preferredSize:[15,'']}");
            ubGrp.add("statictext {text:'Überdrucken', preferredSize:[-1,35]}");
            
            var inkGrp = tablePnl.add("group {orientation:'column', alignChildren:'center', preferredSize:[50,'']}");
            inkGrp.add("statictext {text:'Verbrauch (g)', preferredSize:[-1,35]}");

        var btnGrp = win.add("group {orientation: 'row'}");            
            var okBtn = btnGrp.add("button {text:'Ok', name:'Ok'}");            
            var cclBtn = btnGrp.add("button {text: 'Cancel', name:'Cancel'}");
            
        for ( var i = 0; i < this.spotChans.length; i+=1) {
            var spotChan = this.spotChans[i];
            
            var nameText = nameGrp.add("statictext",undefined, spotChan.name, {});
            nameText.preferredSize.height = 25; 
            nameText.text = spotChan.name;
            nameText.name = "nameText";
            
            var areaText = areaGrp.add("statictext", undefined, "", {characters: 9, name:"areaText"+i});
            areaText.preferredSize.height = 25; 
            areaText.text = Math.abs(spotChan.area).toFixed(1);
            areaText.text += ' cm²';

            var covText = covGrp.add("statictext", undefined, "", {characters: 6, name:"covText"+i});
            covText.preferredSize.height = 25;
            covText.text = Math.abs((spotChan.area / this.totalArea)*100).toFixed(0);
            covText.text += ' %';

            var ubCheck = ubGrp.add("checkbox", undefined, "", {name:"ubCheck"+i});
            ubCheck.preferredSize.height = 25;
            ubCheck.myRow = (Number(i));
            ubCheck.value = spotChan.overprint || false;

            var screenDrop = screenGrp.add("dropdownlist", undefined, this.screenList, {name:"screenDrop"+i});
            screenDrop.selection = screenDrop.items[3];
            screenDrop.preferredSize.height = 25;
            screenDrop.myRow = (Number(i));

            var inkText = inkGrp.add("statictext", undefined, 00, {characters:6,name:"inkText"+i});
            inkText.preferredSize.width = 50;
            inkText.preferredSize.height = 25;

            ubCheck.onClick = function () {               
                win.calculate_line(this.myRow);
            };

            screenDrop.onChange = function () {               
                win.calculate_line(this.myRow);
            };
        }

        runEdit.onChange = function () {
            win.calc_all();
        }  

        usageEdit.onChange = function () {
            win.calc_all();
        }  

        rakelDrop.onChange = function () {
            win.calc_all();
        }

        okBtn.onClick = function() {
            for (var i = 0; i < that.spotChans.length; i++) {
                var spotChan = that.spotChans[i];
                spotChan.screen = screenGrp.children[i+1].selection.text;
                spotChan.inkVolume = inkGrp.children[i+1].text;
            }
            win.close();
        };
    
        cclBtn.onClick = function() {
            retval = false;
            win.close();
        };

    win.onShow = function (){
        win.calc_all();
    }

    this.win = win;
    return win;
};

module.exports = AreaDialog;