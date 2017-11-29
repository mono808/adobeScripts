var f_id = {

    viewPrefSwitch : 
    {

        set : function(mode, save) {
            this.myDoc = app.activeDocument;
            this.myLayoutWin = app.activeDocument.layoutWindows.item(0);
            this.myOldViewDisplaySettings = this.myLayoutWin.viewDisplaySetting;
            this.myOldBlendSpace = this.myDoc.transparencyPreferences.blendingSpace;
            switch (mode) {
                case 'fast' :
                    this.myLayoutWin.viewDisplaySetting = ViewDisplaySettings.OPTIMIZED;
                    this.myDoc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;

                break;
                case 'normal' :
                    this.myLayoutWin.viewDisplaySetting = ViewDisplaySettings.TYPICAL;
                    this.myDoc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;
                break;
                case 'quality' : 
                    this.myLayoutWin.viewDisplaySetting = ViewDisplaySettings.HIGH_QUALITY;
                    this.myDoc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;
                break;                
            }
            if(save) {
                this.myOldViewDisplaySettings = this.myLayoutWin.viewDisplaySetting;
            }
        },

        reset : function () {
            this.myLayoutWin.viewDisplaySetting = this.myOldViewDisplaySettings;
            this.myDoc.transparencyPreferences.blendingSpace = this.myOldBlendSpace;
        },            
    },
    measureUnitSwitch : 
    {

        set : function(myUnit) {
            this.doc = app.activeDocument;
            this.OldXUnits = this.doc.viewPreferences.horizontalMeasurementUnits;
            this.OldYUnits = this.doc.viewPreferences.verticalMeasurementUnits;

            this.doc.viewPreferences.horizontalMeasurementUnits = myUnit;
            this.doc.viewPreferences.verticalMeasurementUnits = myUnit;
        },

        reset : function() {
            this.doc.viewPreferences.horizontalMeasurementUnits = this.OldXUnits;
            this.doc.viewPreferences.verticalMeasurementUnits = this.OldYUnits;
        }
    },
    // saves the corresponding file to the customer- and jobNr-Folder
    save_doc : function (dest, saveOps, close) 
    {
        var saveFile = new File (dest),
            saveFolder,
            saveDoc;      
        
        if (!saveFile.parent.exists) {
            saveFolder = new Folder(saveFile.parent)
            saveFolder.create();
        };

        saveDoc = app.activeDocument;
        
        saveDoc.save (saveFile);
        
        if (close === true)  {
            saveDoc.close();
        };
        return saveFile;
    },
    fitPage2Art : function () 
    {
        var doc = app.activeDocument,
            selection = [],
            hilfsLayer = doc.layers.item('hilfsLayer');

        var i, 
            maxI = doc.allPageItems.length,
            pI;
        for (i = 0; i < maxI; i+=1) {
            pI = doc.allPageItems[i];
            if ((pI.locked == false) && (pI.name != 'sepBG')) {
                selection.push(pI);
            };
        };

        var selBounds = selection[0].geometricBounds,
            j;

        maxI = selection.length;

        for (i = 0; i < maxI; i+=1) {
            pI = selection[i];
            for (j = 0; j < pI.geometricBounds.length; j+=1) {
                
                if ( (j === 0 || j === 1) && (pI.itemLayer != hilfsLayer) ) {
                    if (pI.geometricBounds[j] < selBounds[j]) {
                        selBounds[j] = pI.geometricBounds[j]
                    };
                } else if ( (j === 2 || j === 3) && (pI.itemLayer != hilfsLayer) ) {
                    if (pI.geometricBounds[j] > selBounds[j]) {
                        selBounds[j] = pI.geometricBounds[j];
                    };
                };
            };
        };

        this.reframeIt( doc.pages[0], selBounds );

        //app.layoutWindows[0].activePage = doc.pages[0];
        app.layoutWindows[0].zoom(ZoomOptions.FIT_PAGE);
    },
    fitPageWidth2Art : function (myPage) 
    {
            
        var newPageBounds = [];
        
        var k,
            //maxK = myPage.rectangles.length,
            maxK = myPage.pageItems.length,
            pI;

        for (k = 0; k < maxK; k+=1) {
            pI = myPage.pageItems[k];

            if (!pI.locked) {
                if (k===0) {
                    newPageBounds = pI.geometricBounds;
                    continue
                }

                var j,
                    maxJ = pI.geometricBounds.length,
                    bound,
                    newPageBound;

                for (j = 0; j < maxJ; j+=1) {
                    bound = pI.geometricBounds[j];
                    newPageBound = newPageBounds[j];
                    
                    // only checks the y coordinates, pagewidth has to remain constant
                    if (j === 0) {
                        if (bound < newPageBound) {
                            newPageBounds[j] = bound
                        }
                    } else if (j ===2) {
                        if (bound > newPageBound) {
                            newPageBounds[j] = bound;
                        }
                    }
                }
            }
        }

        // pageWidth has to remain constant;
        newPageBounds[1] = 0;
        newPageBounds[3] = myPage.bounds[3];

        this.reframeIt(myPage, newPageBounds);
    },
    reframeIt : function (item, newBounds) 
    {
        if(item.constructor.name === 'Page') {
            var rec = item.rectangles.add({ geometricBounds: [newBounds[0], newBounds[1], newBounds[2], newBounds[3]] });
        } else {
            if(item.parentPage) {
                var rec = item.parentPage.rectangles.add({ geometricBounds: [newBounds[0], newBounds[1], newBounds[2], newBounds[3]] });
            } else {
                var rec = item.parent.rectangles.add({ geometricBounds: [newBounds[0], newBounds[1], newBounds[2], newBounds[3]] });
            }
        }

        var topLeft = rec.resolve(AnchorPoint.TOP_LEFT_ANCHOR,CoordinateSpaces.SPREAD_COORDINATES)[0],
            bottomRight = rec.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR,CoordinateSpaces.SPREAD_COORDINATES)[0],
            corners = [topLeft, bottomRight];

        rec.remove();
        
        item.reframe(CoordinateSpaces.SPREAD_COORDINATES, corners);
    },
    print2PS : function (targetFile, printPreset) 
    {
        var myPPreset = printPreset.constructor.name == 'PrinterPreset' ? printPreset : app.printerPresets.item(printPreset),            
            f = targetFile instanceof File ? targetFile : new File(targetFile),
            doc = app.activeDocument,
            myDPPref = doc.printPreferences;

        with(myDPPref) {
            printer = Printer.postscriptFile;
            activePrinterPreset = myPPreset;        
            printFile = f;            
        }

        return doc.print(false, undefined);
    },
    // checks if an style is already created and returns it
    // or creates the style and returns it
    checkCreateStyle : function (type, name) 
    {
        var myDoc = app.activeDocument,
            existingStyles,
            newStyle = null;

        switch(type) {
            case 'cell' :
                existingStyles = myDoc.cellStyles;
            break;
            case 'paragraph' :
                existingStyles = myDoc.paragraphStyles;
            break;
            case 'table' : 
                existingStyles = myDoc.tableStyles;
            break;
            case 'character':
                existingStyles = myDoc.characterStyles;
            break;
            case 'object' :
                existingStyles = myDoc.objectStyles;
            break;
            case 'textDefaults' :
                newStyle = myDoc.textDefaults;
            break;
        }
        
        if(!newStyle) {
            try{
                newStyle = existingStyles.item(name);
                var check = newStyle.name;
            } catch (myError){  
                newStyle = existingStyles.add({name:name});
            }
        }
        return newStyle;
    },

    get_height : function (item) 
    {
        return (item.geometricBounds[2] - item.geometricBounds[0]).toFixed(0);
    },
    get_width : function (item) 
    {
        return (item.geometricBounds[3] - item.geometricBounds[1]).toFixed(0);
    },
    move_item1_below_item2 : function (item1, item2, distance) 
    {
        var xy = [item1.geometricBounds[1], item2.geometricBounds[2] + distance];
        item1.move(xy);
    },
    move_item1_above_item2 : function (item1, item2, distance) 
    {
        var item1Height = item1.geometricBounds[2] - item1.geometricBounds[0];
        var xy = [item1.geometricBounds[1], item2.geometricBounds[0] - item1Height - distance];
        item1.move(xy);
    },
    align_item1_vertically_to_item2 : function (item1, item2) 
    {
        item1Height = item1.geometricBounds[2] - item1.geometricBounds[0];
        item2Height = item2.geometricBounds[2] - item2.geometricBounds[0];
        
        var x = item1.geometricBounds[1];
        var y = item2.geometricBounds[0] + item2Height/2 - item1Height/2;
        
        item1.move([x,y]);
    },
    center_item_on_page : function (item, page) 
    {
        var pageHeight = page.bounds[2] - page.bounds[0],
            pageWidth = page.bounds[3] - page.bounds[1],
            pageCenter = [page.bounds[1] + pageWidth/2, page.bounds[0] + pageHeight/2];

        var itemHeight = item.geometricBounds[2] - item.geometricBounds[0];
        var itemWidth = item.geometricBounds[3] - item.geometricBounds[1];
        
        var x = pageCenter - itemWidth/2;
        var y = pageCenter - itemHeight/2;

        item.move([x,y]);
    },
    calculate_item_aspect_ratio : function (item) 
    {
        var itemHeight = item.geometricBounds[2] - item.geometricBounds[0];
        var itemWidth = item.geometricBounds[3] - item.geometricBounds[1];
        return itemWidth/itemHeight;
    },
    fitFrameToText : function (tF) 
    {
    
        tF.fit(FitOptions.FRAME_TO_CONTENT);
        
        var oldBounds,
            newBounds;
        
        while (tF.overflows) {
            oldBounds = tF.geometricBounds;
            newBounds = [oldBounds[0], oldBounds[1], oldBounds[2]+1, oldBounds[3]];
            this.reframeIt(tF, newBounds);
        }
        
        while (!tF.overflows) {
            oldBounds = tF.geometricBounds;
            newBounds = [oldBounds[0], oldBounds[1]+1, oldBounds[2], oldBounds[3]-1];
            this.reframeIt(tF, newBounds);
        }

        // underline characters get cut off, so add 1mm below the last line
        oldBounds[2] += 1;
        this.reframeIt(tF, oldBounds);
    },
    createDocPresetFromMaster : function ()
    {
        //Creates a document preset based on the current document settings.

        if(app.documents.length > 0){
            var myDoc = app.documents.item(0); 
            var myDPreset = app.documentPresets.item("MockupMasterPreset");
            
            try {var myPresetName = myDPreset.name}
            catch (myError){myDPreset = app.documentPresets.add({name:"MockupMasterPreset"})};

            app.viewPreferences.horizontalMeasurementUnits
                = myDoc.viewPreferences.horizontalMeasurementUnits;
            app.viewPreferences.verticalMeasurementUnits
                = myDoc.viewPreferences.verticalMeasurementUnits;

            var myDPrefs = myDoc.documentPreferences;
            var myMPrefs = app.activeDocument.marginPreferences;

            myDPreset.left = myMPrefs.left;
            myDPreset.right = myMPrefs.right;
            myDPreset.top = myMPrefs.top;
            myDPreset.bottom = myMPrefs.bottom;
            myDPreset.columnCount = myMPrefs.columnCount;
            myDPreset.columnGutter = myMPrefs.columnGutter;
            myDPreset.documentBleedBottomOffset = myDPrefs.documentBleedBottomOffset;
            myDPreset.documentBleedTopOffset = myDPrefs.documentBleedTopOffset;
            myDPreset.documentBleedInsideOrLeftOffset = myDPrefs.documentBleedInsideOrLeftOffset;
            myDPreset.documentBleedOutsideOrRightOffset = myDPrefs.documentBleedOutsideOrRightOffset;
            myDPreset.facingPages = myDPrefs.facingPages;
            myDPreset.pageHeight = myDPrefs.pageHeight;
            myDPreset.pageWidth = myDPrefs.pageWidth;
            myDPreset.pageOrientation = myDPrefs.pageOrientation;
            myDPreset.pagesPerDocument = 1;
            myDPreset.slugBottomOffset = myDPrefs.slugBottomOffset;
            myDPreset.slugTopOffset = myDPrefs.slugTopOffset;
            myDPreset.slugInsideOrLeftOffset = myDPrefs.slugInsideOrLeftOffset;
            myDPreset.slugRightOrOutsideOffset = myDPrefs.slugRightOrOutsideOffset;
        };
        return myDPreset;
    },
    copyStyles : function (source, dest)
    {
        dest.importStyles(ImportFormat.PARAGRAPH_STYLES_FORMAT, source.fullName);
        dest.importStyles(ImportFormat.CELL_STYLES_FORMAT, source.fullName);
        dest.importStyles(ImportFormat.TABLE_STYLES_FORMAT, source.fullName);
        dest.importStyles(ImportFormat.OBJECT_STYLES_FORMAT, source.fullName);
    },
    copyLayers : function (source, dest)
    {
        for(var i = 0, maxI = source.layers.length; i < maxI; i += 1) {
            var sourceLayer = source.layers[i],
                destLayer;
            try {
                destLayer = dest.layers.item(sourceLayer.name).name;
            } catch(e) {
                destLayer = dest.layers.add({name: sourceLayer.name});
                destLayer.move(LocationOptions.AT_END);
            };
        };
        dest.layers.item('Ebene 1').remove();
    }, 
    copyMasterPages : function (sourceDoc,destDoc) 
    {

        for (var i = 0, maxI = sourceDoc.masterSpreads.length; i < maxI; i += 1) {
            var mS = sourceDoc.masterSpreads[i];
            var dupedSpread = mS.duplicate(LocationOptions.AT_END, destDoc);
        };

        try {
            var defaultSpread = destDoc.masterSpreads.item('A-Musterseite');
            defaultSpread.remove();
        } catch (e) {
            $.writeln(e)
        };
    },
    split_frame : function (myFrame) 
    {
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
        var page = myFrame.parentPage;
        var mrgPrf = page.marginPreferences;
        var myObjectList = new Array;
        if(myFrame) {
            myDisplayDialog([myFrame]);
        } else if (app.documents.length != 0) 
        {
            if(app.selection.length != 0){
                for(myCounter = 0; myCounter < app.selection.length; myCounter++){
                    switch(app.selection[myCounter].constructor.name){
                        case "GraphicLine":
                        case "Oval":
                        case "Polygon":
                        case "Rectangle":
                        case "TextFrame":
                            myObjectList.push(app.selection[myCounter]);
                            break;          
                    }
                }
                if(myObjectList.length !=0){
                    myDisplayDialog(myObjectList);
                }
            }
        }
        function myDisplayDialog (myObjectList)
        {
            var myLabelWidth = 90;
            // var myFrameTypes = ["Unassigned", "Text", "Graphic"];
            var myDialog = app.dialogs.add({name:"Wieviele Rahmen für Druckvorschau erstellen?"});
            with(myDialog.dialogColumns.add()){
                with(dialogRows.add()){
                    with(dialogColumns.add()){
                        staticTexts.add({staticLabel:"Spalten:", minWidth:myLabelWidth});
                        staticTexts.add({staticLabel:"Zeilen:", minWidth:myLabelWidth});                            
                    }
                    with(dialogColumns.add()){                            
                        var myNumberOfColumnsField = integerEditboxes.add({editValue:2});
                        var myNumberOfRowsField = integerEditboxes.add({editValue:1});
                    }
                }
                // with(dialogRows.add()){
                //     with(dialogColumns.add()){
                //         staticTexts.add({staticLabel:"Row Gutter:", minWidth:myLabelWidth});
                //     }
                //     with(dialogColumns.add()){
                //         var myRowGutterField = measurementEditboxes.add({editValue:12, editUnits:MeasurementUnits.points});
                //     }
                // }
                // with(dialogRows.add()){
                //     with(dialogColumns.add()){
                //         staticTexts.add({staticLabel:"Column Gutter:", minWidth:myLabelWidth});
                //     }
                //     with(dialogColumns.add()){
                //         var myColumnGutterField = measurementEditboxes.add({editValue:12, editUnits:MeasurementUnits.points});
                //     }
                // }
                // with(dialogRows.add()){
                //     with(dialogColumns.add()){
                //         staticTexts.add({staticLabel:"Frame Type:", minWidth:myLabelWidth});
                //     }
                //     with(dialogColumns.add()){
                //         var myFrameTypeDropdown = dropdowns.add({stringList:myFrameTypes, selectedIndex:0});
                //     }
                // }
                // var myRetainFormattingCheckbox = checkboxControls.add({staticLabel:"Retain Formatting and Contents", checkedState:true})
                // var myDeleteObjectCheckbox = checkboxControls.add({staticLabel:"Delete Original Object", checkedState:true})
            }
            var myResult = myDialog.show();
            if(myResult == true){
                var myNumberOfRows = myNumberOfRowsField.editValue;
                var myNumberOfColumns = myNumberOfColumnsField.editValue;
                // var myRowGutter = myRowGutterField.editValue;
                // var myColumnGutter = myColumnGutterField.editValue;
                // var myRetainFormatting = myRetainFormattingCheckbox.checkedState;
                // var myDeleteObject = myDeleteObjectCheckbox.checkedState;
                // switch(myFrameTypeDropdown.selectedIndex){
                //     case 0:
                //         myFrameType = ContentType.unassigned;
                //         break;
                //     case 1:
                //         myFrameType = ContentType.textType;
                //         break;
                //     case 2:
                //         myFrameType = ContentType.graphicType;
                //         break;
                // }
                myDialog.destroy();
                mySplitFrames(myObjectList, myNumberOfRows, myNumberOfColumns, mrgPrf.top, mrgPrf.top, ContentType.graphicType, true, true);
            }
            else{
                myDialog.destroy();
            }
        }
        function mySplitFrames (myObjectList, myNumberOfRows, myNumberOfColumns, myRowGutter, myColumnGutter, myFrameType, myRetainFormatting, myDeleteObject)
        {
            var myOldXUnits = app.activeDocument.viewPreferences.horizontalMeasurementUnits;
            var myOldYUnits = app.activeDocument.viewPreferences.verticalMeasurementUnits;
            app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
            app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;
            for(var myCounter = 0; myCounter < myObjectList.length; myCounter ++){
                mySplitFrame(myObjectList[myCounter], myNumberOfRows, myNumberOfColumns, myRowGutter, myColumnGutter, myFrameType, myRetainFormatting, myDeleteObject);
            }
            app.activeDocument.viewPreferences.horizontalMeasurementUnits = myOldXUnits;
            app.activeDocument.viewPreferences.verticalMeasurementUnits = myOldYUnits;
        }
        function mySplitFrame (myObject, myNumberOfRows, myNumberOfColumns, myRowGutter, myColumnGutter, myFrameType, myRetainFormatting, myDeleteObject)
        {
            var myX1, myY1, myX2, myY2, myNewObject;
            var myBounds = myObject.geometricBounds;
            var myWidth = myBounds[3]-myBounds[1];
            var myHeight =  myBounds[2]-myBounds[0];
            //Don't bother making the frames if the width/height of the frame is too small
            //to accomodate the row/column gutter values.   
            if((myRowGutter * (myNumberOfRows - 1) < myHeight) && (myColumnGutter * (myNumberOfColumns - 1) < myWidth)){
                var myColumnWidth = (myWidth - (myColumnGutter * (myNumberOfColumns - 1)))/myNumberOfColumns;
                var myRowHeight =  (myHeight - (myRowGutter * (myNumberOfRows - 1)))/myNumberOfRows;
                for(var myRowCounter = 0; myRowCounter < myNumberOfRows; myRowCounter ++){
                    myY1 = myBounds[0]+(myRowHeight*myRowCounter)+(myRowGutter*myRowCounter);
                    myY2 = myY1 + myRowHeight;
                    for(var myColumnCounter = 0; myColumnCounter < myNumberOfColumns; myColumnCounter ++){
                        myX1 = myBounds[1]+(myColumnWidth*myColumnCounter)+(myColumnGutter*myColumnCounter);
                        myX2 = myX1 + myColumnWidth;
                        if(myRetainFormatting == true){
                            myNewObject = myObject.duplicate();
                            myNewObject.geometricBounds = [myY1, myX1, myY2, myX2];
                        }
                        else{
                            myNewObject = myObject.parent.rectangles.add(undefined, undefined, undefined, {geometricBounds:[myY1, myX1, myY2, myX2], contentType:myFrameType});
                        }
                        if(myRetainFormatting == false){
                            myNewObject.contentType=myFrameType;
                        }
                    }
                }
                if(myDeleteObject == true){
                    myObject.remove();
                }
            }
        }
        function myGetProperties (myObject){
            for(myProperty in myObject.properties){
            }
        }            
    }
}
