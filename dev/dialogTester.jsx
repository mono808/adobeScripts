    var exportStyleDialog = function () {
        var returnValue = {
            preset: null,
            neutral: null
        };

        var activeWindow = app.activeWindow;
        var width = activeWindow.bounds[3]-activeWindow.bounds[1];
        centerWidth = activeWindow.bounds[1] + width/2;
        var height = activeWindow.bounds[2]-activeWindow.bounds[0];
        centerHeight = activeWindow.bounds[0] + height/2;
        
        var dialogWidth = 425;
        var dialogHeight = 400;
        var dLeft = centerWidth-dialogWidth/2;
        var dRight = centerWidth+dialogWidth/2;
        var dTop = centerHeight-dialogHeight/2;
        var dBottom = centerHeight+dialogHeight/2;


        //var win = new Window("dialog", "Neutral Ansicht erstellen?",[dLeft,dTop,dRight,dBottom]);
        var win = new Window("dialog", "Neutral Ansicht erstellen?",undefined);
        this.windowRef = win;
        win.presetGroup = win.add("Group");
        win.styleGroup = win.add("Group");

        win.presetGroup.pdfButton = win.presetGroup.add("Button", undefined, "pdf");
        win.presetGroup.jpgButton = win.presetGroup.add("Button", undefined, "jpg");

        win.styleGroup.normalBtn = win.styleGroup.add("Button", undefined, "Normal");
        win.styleGroup.neutralBtn = win.styleGroup.add("Button", undefined, "NEUTRAL");
        
        // Register event listeners that define the button behavior
        win.presetGroup.pdfButton.onClick = function () {
            returnValue.exportFormat = ExportFormat.PDF_TYPE;
            returnValue.saveFile = new File(savePath + '.pdf');
            //setPdfExportPreferences();
            this.text = 'PDF';
            this.parent.jpgButton.text = 'jpg';
        }

        win.presetGroup.jpgButton.onClick = function () {
            returnValue.exportFormat = ExportFormat.JPG;
            returnValue.saveFile = new File(savePath + '.jpg');
            //setJpgExportPreferences();
            this.text = 'JPG';  
            this.parent.pdfButton.text = 'pdf';
        }
        
        win.styleGroup.normalBtn.onClick = function() {
            returnValue.neutral = false;
            win.close();
        };
        win.styleGroup.neutralBtn.onClick = function() {
            returnValue.neutral = true;
            win.close();
        };

        // Display the window
        win.show();
            
        return returnValue;
    }
var savePath = '~/Documents/shalala';
var returnValue = exportStyleDialog ();