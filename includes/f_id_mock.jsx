var f_id_mock = {
    choose_jobNr : function (jobNr) 
    {
        var win = new Window('dialog', 'Choose Job Number:');

        var ovrgrp = win.add('group')
    },

    choose_textil_color : function () 
    {
        var page, pIndex,
            graphic, gIndex, link,
            selectedLayerName, graphicLayer, gLIndex,
            doc = app.activeDocument,
            layer = doc.layers.item('Textils'),
            pages = doc.pages,
            fixedLayers = /(Shirt|Front|Back|Naht)/i;

        for(pIndex=0; pIndex < pages.length; pIndex++)
        {
            page = pages[pIndex];
            doc.layoutWindows.item(0).activePage = page;
            for (gIndex = 0; gIndex < layer.allGraphics.length; gIndex++)
            {
                graphic = layer.allGraphics[gIndex];
                link = graphic.itemLink;
                if (link && graphic.parentPage === page)
                {
                    if(((graphic.constructor.name == "Image" && link.linkType == "Photoshop") || 
                       (graphic.constructor.name == "PDF" && link.linkType == 'Adobe Portable Document Format (PDF)')) &&
                        link.parent.graphicLayerOptions.graphicLayers.length > 1)
                    {
                        selectedLayerName = (f_all.choose_from_array(link.parent.graphicLayerOptions.graphicLayers, 'name')).name;
                        gLIndex = link.parent.graphicLayerOptions.graphicLayers.length-1;
                        for(gLIndex = 0; gLIndex < link.parent.graphicLayerOptions.graphicLayers.length; gLIndex++)
                        {
                            graphicLayer = link.parent.graphicLayerOptions.graphicLayers[gLIndex];
                            if(!fixedLayers.test(graphicLayer.name)) 
                            {
                                if(graphicLayer.name !== selectedLayerName) {                                    
                                    graphicLayer.currentVisibility = false;
                                } else {
                                    graphicLayer.currentVisibility = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    getScale : function ()
    {
        var docwidth = app.activeDocument.documentPreferences.pageWidth;
        return (docwidth / 297);
    },

    showShopLogo : function  (shop) 
    {
        var myDoc = app.activeDocument,
            fixedMaster = myDoc.masterSpreads.item('A-FixedStuff');

        if (shop == 'wme') {
            var logo = fixedMaster.pageItems.item('wmeLogo');
            logo.visible = true;
            logo = fixedMaster.pageItems.item('csLogo');
            logo.visible = false;
        } else {
            var logo = fixedMaster.pageItems.item('csLogo');
            logo.visible = true;
            logo = fixedMaster.pageItems.item('wmeLogo');
            logo.visible = false;            
        }
    },

    fillJobInfos : function (nfo)
    {
        var doc = app.activeDocument;
        var fixedMS = doc.masterSpreads.item('A-FixedStuff'),
            jobFrameBounds = fixedMS.pageItems.item('mJobFrame').geometricBounds;
              
        var tf = fixedMS.textFrames.add({
                itemLayer: doc.layers.item('Infos'),
                geometricBounds:jobFrameBounds});

        //tf.textFramePreferences.insetSpacing = 3.075*this.getScale();

        var fixS = doc.paragraphStyles.item("fixedTextStyle"),
            variS = doc.paragraphStyles.item("variableTextStyle"),
            jobS = doc.paragraphStyles.item("jobTextStyle"),
            tempStr;
        
        tempStr = 'Auftraggeber:\r';
        tempStr += nfo.client;
        tempStr += '\rAuftragsnummer:\r';
        tempStr += nfo.jobNr;
        tempStr += '\rReferenz:\r'
        if(nfo.jobNr != nfo.refNr) {
            tempStr += nfo.refNr;
        } else {
            tempStr += '---';
        }           
        tempStr += '\rAuftragsname:\r';
        tempStr += nfo.jobName;

        tf.contents = tempStr;
        var j, maxJ = tf.parentStory.paragraphs.length, pg;
        for (j = 0; j < maxJ; j += 1) {
            pg = tf.parentStory.paragraphs[j];
            if(j % 2 == 0) {
                pg.applyParagraphStyle(fixS, true);
            } else {
                pg.applyParagraphStyle(variS, true);
            }
        }

        // fill the intern jobNr textframe
        var intern_job_frame = fixedMS.pageItems.item('jobNr_kuerzel');
        tempStr = nfo.client;
        tempStr +=' - ';
        tempStr += nfo.jobNr;        
        if(nfo.jobNr != nfo.refNr) {
            tempStr += '\nND ';
            tempStr += nfo.refNr;
        }
        tempStr += ' - ';
        tempStr += f_all.get_kuerzel();

        intern_job_frame.contents = tempStr;
        intern_job_frame.paragraphs.item(0).applyParagraphStyle(jobS);
    },

    labelPages : function (templateDoc) 
    {
        var i, maxI, myPage, pageGraphics, textilName, j, maxJ;

        // go through all pages
        for(i = 0, maxI = templateDoc.pages.length; i < maxI; i += 1) {
            myPage = templateDoc.pages[i];

            //go through graphics on page
            if(myPage.allGraphics && myPage.allGraphics.length > 0) {
                pageGraphics = myPage.allGraphics;
                for(j = 0, maxJ = pageGraphics.length; j < maxJ; j += 1) {
                    //if graphic is on textil-layer
                    if(pageGraphics[j].itemLayer === templateDoc.layers.item('Textils')) {
                        textilName = pageGraphics[j].itemLink.name;
                        textilName = textilName.substring(0, textilName.lastIndexOf('.'));
                        break;
                    }
                }
            } else {
                textilName = 'leere Vorlage';
            }

            myPage.label = textilName;
        }
    },

    getPageRefs : function (templateDoc, namesArray) 
    {
        var i, maxI, pageName, j, maxJ, myPage,
            myTexPages = [];

        for(i = 0, maxI = namesArray.length; i < maxI; i += 1) {
            pageName = namesArray[i];
            for(j = 0, maxJ = templateDoc.pages.length; j < maxJ; j+=1) {
                myPage = templateDoc.pages[j];
                if(myPage.label == pageName) {
                    myTexPages.push(myPage);
                }
            }
        }
        return myTexPages;
    },

    selectTextilePages : function (templateDoc) 
    {
        var win, myPage, i, maxI,
            pageNames = [];

        win = new Window('dialog', 'Textilien wählen:');
        win.spacing = 3;
        
        for (i = 0, maxI = templateDoc.pages.length; i < maxI; i+=1) {
            myPage = templateDoc.pages[i];
            if(myPage.label != 'StyleTester') {
                win[i] = win.add("checkbox", [10, 10, 150, 35], myPage.label);
                win[i].value = false;
            }
        };

        win.okButton = win.add("button", [10, 10 ,150, 35], 'Ok');
            win.okButton.onClick = function() {
                var box,
                    k,
                    maxK;

                for (k = 0, maxK = win.children.length; k < maxK; k += 1) {
                    box = win.children[k];
                    if (box.value === true) {
                        pageNames.push(box.text);
                    };
                };

                win.close();
            };

        win.show();

        pageNames.sort();
        
        return this.getPageRefs(templateDoc, pageNames);
    },

    copySpreads : function (sourceDoc,destDoc, pages2copy) 
    {
        var dupedSpreads = [],
            dupedSpread,
            i,
            maxI,
            myPage;

        for (i = 0, maxI = pages2copy.length; i < maxI; i += 1) {
            myPage = pages2copy[i];
            dupedSpread = myPage.duplicate(LocationOptions.AFTER, destDoc.pages.lastItem());
            dupedSpreads.push(dupedSpread);
        }
        
        try {
            var defaultSpread = destDoc.masterSpreads.item('A-Musterseite');
            defaultSpread.remove();
        } catch (e) {
            $.writeln(e)
        };

        destDoc.pages.item(0).remove();

        return dupedSpreads
    },

    placePrintsOnPage : function (printsArray) 
    {
        
        function getImageRef(pageRef, placedFile) {
            for (var i = 0, maxI = pageRef.allGraphics.length; i < maxI; i += 1) {
                var graphicRef = pageRef.allGraphics[i];
                if (graphicRef.itemLink.filePath === placedFile.fsName) {
                    return graphicRef
                };
            };
        };

        var mN = new MonoNamer();
        var side = mN.side;

        var myDoc = app.activeDocument,
            printLayer = myDoc.layers.item('Prints'),
            myPage = app.activeWindow.activePage;

        // loop through the array of prints to place on the activepage
        var j, maxJ = printsArray.length;
        var pO,
            myPosition,
            x,
            xRef,
            yLine,
            y;

        for (j = 0; j < maxJ; j += 1) 
        {
            pO = printsArray[j];

            // if pO has print position info, use the front or back midline as x coordinate reference
            // so the file will be placed on the front or backside of the shirt
            if(side.hasOwnProperty(pO.nfo.printId))
            {
                if(side[pO.nfo.printId] === 2) 
                {
                    xRef = myPage.guides.item('midlineBack');
                    x = xRef.location;
                    yLine = myPage.graphicLines.item('necklineBack');
                    y = (yLine.geometricBounds[0] + yLine.geometricBounds[2]) / 2;                
                } else 
                {
                    xRef = myPage.guides.item('midlineFront');
                    x = xRef.location;                    
                    yLine = myPage.graphicLines.item('necklineFront');
                    y = (yLine.geometricBounds[0] + yLine.geometricBounds[2]) / 2;
                }
            // if no specific printpos info is in the printId, always place the print on the front
            } else 
            {
                xRef = myPage.guides.item('midlineFront');
                x = xRef.location;                
                yLine = myPage.graphicLines.item('necklineFront');
                y = (yLine.geometricBounds[0] + yLine.geometricBounds[2]) / 2;
            }

            // if there is no preview file, use the druckfile for placing in the mockup instead
            var fileToPlace;
            pO.preview ? fileToPlace = pO.preview : fileToPlace = pO.druck;
            myPage.place(fileToPlace, undefined, printLayer);

            // get the reference to the just placed graphicfile
            pO.placedRef = getImageRef(myPage, fileToPlace);

            // if there are films, position the graphic according to the sep position on the films
            if(pO.film) {
                myPosition = [x+pO.filmInfos.xDist,y+pO.filmInfos.yDist];
                pO.placedRef.parent.move(myPosition);
            } else {
                // center graphic on x guide
                var l = pO.placedRef.parent.geometricBounds[1],
                    r = pO.placedRef.parent.geometricBounds[3],
                myPosition = [x-(r-l)/2,y+80];
                pO.placedRef.parent.move(myPosition);                
            }
            
            // if the bag is printed on both sides
            // duplicate the print and copy it to the backside of the bag
            // and position it exactly like on the frontside
            if(pO.nfo.printId == 'BeutelAA')
            {                
                x = myPage.guides.item('midlineBack').location;
                yLine = myPage.graphicLines.item('necklineBack');
                y = (yLine.geometricBounds[0] + yLine.geometricBounds[2]) / 2;

                myPosition = [x+pO.filmInfos.xDist,y+pO.filmInfos.yDist]
                var rec = pO.placedRef.parent;
                rec.duplicate(myPosition);
            }
        }
    },

    getPrints : function (jobFolder, tech)
    {
        var dd
        var ddFolders = tech ? jobFolder.getFiles('Druckdaten-'+ tech) : jobFolder.getFiles(/Druckdaten-(SD|DTA|DTG|SUB|FLX|FLK|STK)/i);
        var pO = {
                tag : null,
                nfo : null,
                druck : null,
                preview : null,
                film : null
            };

        var i, maxI = ddFolders.length, ddfldr, dFiles, pOs = [];
        for(i=0;i<maxI;i+=1)
        {
            ddfldr=ddFolders[i];
            dFiles = ddfldr.getFiles(rE.print);
            
            var j, maxJ = dFiles.length, dFile, myPO;
            for(j=0;j<maxJ;j+=1)
            {
                dFile = dFiles[j];
                myPO = Object.create(pO);
                myPO.tag = rE.printTag.exec(dFile.displayName)[0];
                myPO.nfo = job.get_nfo_from_filename(dFile);
                myPO.druck = dFile;
                myPO.preview = mofo.folder('previews').getFiles(myPO.tag + '_Preview.*')[0];
                myPO.film = mofo.folder('ddSD').getFiles('*'+ myPO.nfo.printId +'_'+ myPO.nfo.wxh +'_'+ myPO.nfo.tech +'_Film.indd')[0];
                myPO.film ? myPO.filmInfos = this.getFilmInfo(myPO.film) : myPO.filmInfos = '';
                pOs.push(myPO);
            }
        }
        return pOs;
    },

    getFilmInfo : function (filmFile)
    {

        function make_spaces_unbreakable(str) {
            var nbStr = str.replace(/\s/g, '\xa0');
            return nbStr;
        }

        var doc = app.open(filmFile, false),
            vPrefs = doc.viewPreferences,
            oldXUnits,
            oldYUnits,    
            sepInfo = {
                spotsArray : []
            };

        oldXUnits = vPrefs.horizontalMeasurementUnits,
        oldYUnits = vPrefs.verticalMeasurementUnits,            
        vPrefs.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
        vPrefs.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
        
        var vLine = doc.guides.item('vLine'),
            hLine = doc.guides.item('hLine'),            
            sep = doc.layers.item('motivEbene').allGraphics[0],
            sepBounds = sep.geometricBounds;

        var i,maxI,spot;
        for (i = 4, maxI = doc.swatches.length; i < maxI; i += 1)  {
            spot = doc.swatches[i];
            if ((spot.model === ColorModel.SPOT) && (spot.name != 'Registration')) {
                sepInfo.spotsArray.push(make_spaces_unbreakable(spot.name));
            };
        };

        sepInfo.xDist = sepBounds[1] - vLine.location;
        sepInfo.yDist = sepBounds[0] - hLine.location;
        sepInfo.x2Dist = sepBounds[3] - vLine.location;
        sepInfo.y2Dist = sepBounds[2] - hLine.location;
        sepInfo.width = sepBounds[3] - sepBounds[1];
        sepInfo.height = sepBounds[2] - sepBounds[0];

        vPrefs.horizontalMeasurementUnits = oldXUnits;
        vPrefs.verticalMeasurementUnits = oldYUnits;
      
        doc.close(SaveOptions.no);                

        return sepInfo
    },

    update_size_and_stand : function (myPage, myGraphics)
    {
        var myDoc = myPage.parent.parent;
        var infoLayer = myDoc.layers.item('Infos');
        try {
            tF = myPage.textFrames.item('printTableFrame');
            var check = tF.name
        } catch (e) {
            alert('No Table found, use createTable instead');
        }

        var tbl = tF.tables.item(0);
        for(var i = 0, maxI = tbl.columns.length; i < maxI; i += 1) {
            var col = tbl.columns[i];
            if (col.contents[0] === 'Druckstand:') {
                var standIdx = i;
                break;
            }
        }

        var i,
            maxI,
            myGraphic,
            myRow,
            sizeCell,
            standCell,
            oldStand,
            oldString,
            newStand,
            newString;

        for (i = 0, maxI = myGraphics.length; i < maxI; i+= 1) {
            myGraphic = myGraphics[i];
            newStand = myGraphic.get_stand();            
            //myRow = tbl.rows.item(i+1);
            myRow = tbl.rows.item(myGraphic.get_order()+1);

            sizeCell = myRow.cells.item(standIdx-1);
            sizeCell.contents = myGraphic.get_width();

            standCell = myRow.cells.item(standIdx);
            oldString = standCell.contents.split(/\d{1,2}(\.5|,5)?/)[2];

            newString = 'ca. ';
            if(newStand > 0) {
                newString += newStand;
                newString += oldString.replace('über', 'unter');
            } else if(newStand < 0) {
                newString += newStand*-1;                
                newString += oldString.replace('unter', 'über');
            }
            
            standCell.contents = newString;
        }
    },

    create_table : function (myPage)
    {
        function resize_column(myColumn, newWidth) 
        {
            var myTable = myColumn.parent;
            var deltaW = myColumn.width - newWidth;
            myColumn.width = newWidth;
            
            var getIndex = function (myColumn) 
            {
                var i, maxI;
                for (i = 0, maxI = myColumn.parent.columns.length; i < maxI; i+=1) 
                {
                    if(myTable.columns.item(i) === myColumn) {
                        return i
                    };
                };
            };

            var index = getIndex(myColumn);

            var i, maxI, otherColumn;
            for (i = index+1, maxI = myTable.columns.length; i < maxI ; i+=1) 
            {
                otherColumn = myTable.columns.item(i);
                otherColumn.width += deltaW/(myTable.columns.length - 1 - index);
            };
        }

        var infoLayer = myDoc.layers.item('Infos');
        //var textil = get_textil_nfo_from_user();
        var textil = {name: 'Textil', farbe:'Farbe', run: 'XX'};
        var tableString = 'Menge:\tArtikel:\tFarbe(n):\tPosition:\tBreite (mm):\tDruckstand:\tVerfahren:\tDruckfarben:\rx\tx\tx\tx\tx\tx\tx\tx\r';

        try {
            myTF = myPage.textFrames.item('printTableFrame');
            var check = myTF.name;
        } catch (e) {
            var tFBounds = myDoc.masterSpreads.item('A-FixedStuff').pageItems.item('printTabFrame').geometricBounds;
            var myTF = myPage.textFrames.add({geometricBounds:tFBounds, itemLayer:infoLayer, name: 'printTableFrame'});
            myTF.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
        }
        
        while(myTF.tables.length > 0) {
            myTF.tables.item(0).remove();
        }
                
        myTF.contents = tableString;
        myTF.texts.item(0).convertToTable();
        var myTable = myTF.tables.item(0);
        myTable.name = 'filmInfosTable';
        
        var headerRow = myTable.rows.item(0);
        headerRow.rowType = RowTypes.HEADER_ROW;
        headerRow.cells.everyItem().appliedCellStyle = myDoc.cellStyles.item('headerCellStyle');

        myTable.appliedTableStyle = myDoc.tableStyles.item('defaultTStyle');        
        myTable.alternatingFills = AlternatingFillsTypes.ALTERNATING_ROWS;
        
        // adjust with of columsn according to Beutel oder Shirt Ansicht
        // total width is 287
        var scale = this.getScale();
        switch (scale) {
            case 4.5 : widthArr = [20, 25, 35, 35, 25, 53, 35, 60];
            break;
            case 6.5 : widthArr = [18.5, undefined, 33, 27, 31, undefined, 35, undefined];
            break;
            default :  widthArr = [18.5, undefined, 33, 27, 31, undefined, 35, undefined];
        }
        for(var i = 0; i < widthArr.length; i++) {
            if(widthArr[i] != undefined) {
                resize_column(headerRow.columns.item(i), widthArr[i]*scale);    
            }            
        }

        var myRow = myTable.rows.item(1);

        myRow.cells.everyItem().appliedCellStyle = myDoc.cellStyles.item('defaultCellStyle');
        myRow.cells.everyItem().autoGrow = true;

        // var runCell = myRow.cells.item(0);
        // runCell.contents = textil.run;

        // var textilCell = myRow.cells.item(1);
        // textilCell.contents = textil.name;

        // var textilFarbeCell = myRow.cells.item(2);
        // textilFarbeCell.contents = textil.farbe;

        return myTable;
    },
    
    add_preview_page : function () 
    {
        var doc = app.activeDocument;
        var preMaster = doc.masterSpreads.item('C-Preview');
        return doc.pages.add(LocationOptions.AT_END, {appliedMaster: preMaster});
    },

    add_preview_rectangle : function (myPage) 
    {
        var doc = app.activeDocument,
            x1, x2, y1, y2,
            margPref = myPage.marginPreferences,
            previewFrameStyle = doc.objectStyles.item('previewFrameStyle');
        y1 = margPref.top;
        x1 = margPref.left;
        y2 = myPage.bounds[2] - margPref.bottom;
        x2 = myPage.bounds[3] - margPref.right;
        var recBounds = [y1,x1,y2,x2];
        return myPage.rectangles.add(undefined, undefined, undefined, {geometricBounds:recBounds, contentType: ContentType.GRAPHIC_TYPE, appliedObjectStyle: previewFrameStyle});
    },

    get_placed_graphics : function (myPage,myLayer)
    {
        var myGraphics = [];
        var g, maxG, placedGraphic, myGraphic;
        for (g = 0, maxG = myPage.allGraphics.length; g < maxG; g += 1) 
        {  
            placedGraphic = myPage.allGraphics[g];
            if (placedGraphic.itemLayer === myLayer) {
                myGraphic = new MonoGraphic(placedGraphic);
                myGraphics.push(myGraphic);
            }
        }
        
        myGraphics.sort(function(a,b) {
            var mN = new MonoNamer();
            return mN.name_side(a.side) - mN.name_side(b.side);
        });

        return myGraphics;
    },

    write_graphic_infos_to_table : function (myTable, myGraphics) 
    {
        function get_textil_nfo_from_user(myGraphic) {
            var result = {};
            
            var win = new Window('dialog', 'Textilangaben:');

            //win.textilPanel = win.add('panel', [0, 0, 400, 110], "verwendeter Artikel und Farbe(n):");
            win.textilPanel = win.add('panel', undefined, "verwendeter Artikel und Farbe(n):");

            win.textilPanel.textil      = win.textilPanel.add("edittext", [5, 10,  390, 35], myGraphic.get_textil_name(), { enterKeySignalsOnChange : true });
            win.textilPanel.color       = win.textilPanel.add("edittext", [5, 40,  390, 65], myGraphic.get_textil_color(), { enterKeySignalsOnChange : true });
            win.textilPanel.run         = win.textilPanel.add("edittext", [5, 70,  390, 95], 'XXX', { enterKeySignalsOnChange : true });
            win.textilPanel.beidseitig  = win.textilPanel.add("checkbox", [5, 100, 390, 125], 'Textil beidseitig bedrucken',{enabled:true});
            win.textilPanel.hinweis     = win.textilPanel.add("edittext", [5, 130, 390, 155], 'Hinweis für SD?', { enterKeySignalsOnChange : true });

            win.quitBtn = win.add('button', [120,275,200,295], 'Fertig');

            win.quitBtn.onClick = function() {
                result.name = win.textilPanel.textil.text;
                result.color = win.textilPanel.color.text;
                result.run = win.textilPanel.run.text;
                result.beidseitig = win.textilPanel.beidseitig.value;
                result.hinweis = win.textilPanel.hinweis.text != 'Hinweis für SD?' ? win.textilPanel.hinweis.text : null;                
                win.close();
            };

            win.show();
            return result
        }

        var i, maxI, myGraphic,
            textil,
            myRow,
            runCell,texCell,texColorCell,posCell,sizeCell,standCell,techCell,colorsCell,
            standString;

        for (i = 0, maxI = myGraphics.length; i < maxI; i+= 1) {
            myGraphic = myGraphics[i];
            
            if(i===0) {
                textil = get_textil_nfo_from_user(myGraphic);
            }
            else if(textil.beidseitig) {
                textil = {run:' ', name:' ', color:' '};
            }        
            else if(i>0 && myGraphic.get_textil_name() !== myGraphics[i-1].get_textil_name()){
                textil = get_textil_nfo_from_user(myGraphic);
            }
        
            if((i+2) > myTable.rows.length) {
                myRow = myTable.rows.add(LocationOptions.AT_END, myTable);
            } else {
                myRow = myTable.rows.item(i+1);
            }

            myRow.cells.everyItem().appliedCellStyle = myDoc.cellStyles.item('defaultCellStyle');
            myRow.cells.everyItem().autoGrow = true;
            
            runCell = myRow.cells.item(0);
            runCell.contents = textil.run || 'XX';

            texCell = myRow.cells.item(1);
            texCell.contents = textil.name || myGraphic.get_textil_name();

            texColorCell = myRow.cells.item(2);
            texColorCell.contents = textil.color || myGraphic.get_textil_color();

            posCell = myRow.cells.item(3);
            posCell.contents = myGraphic.get_nfo('printId') || myGraphic.side;

            sizeCell = myRow.cells.item(4);
            sizeCell.contents = myGraphic.get_width();

            standCell = myRow.cells.item(5);
            standString = 'ca. ';
            var stand = myGraphic.get_stand();            
            if(stand > 0) {
                standString += stand + ' cm unter der';
                standString += this.getScale() == 6.5 ? ' Kragennaht' : ' Taschenöffnung';
            } else if (stand < 0) {
                standString += (stand*-1) + ' cm über der Markierung';
            }
            
            standCell.contents = standString;

            techCell = myRow.cells.item(6);
            techCell.contents = myGraphic.get_nfo('tech') || 'Siebdruck';

            colorsCell = myRow.cells.item(7);
            colorsCell.appliedCellStyle = myDoc.cellStyles.item('defaultCellStyle');
            
            myGraphic.colors = myGraphic.get_colors();
            if(myGraphic.colors && myGraphic.colors.join) {
                colorsCell.contents = myGraphic.colors.join(', ');
            } else if (myGraphic.colors) {
                colorsCell.contents = myGraphic.colors;
            } else {
                colorsCell.contents = 'Folgt';
            }

            // keine 2 Spalte ausfüllen wenn Beutel beidseitig
            if(myGraphic.get_nfo('printId') == 'BeutelAA') {i+=1}

            if(i==0 && textil.hinweis) {
                this.create_hinweis_frame(textil.hinweis);
            }
            if(myGraphics.length == 1) {
                //myRow = myTable.rows.lastItem().remove();
                myTable.rows.lastItem().remove();
            }
        }
    },

    read_tables : function(doc) 
    {

        var infoLayer = doc.layers.item('Infos'),
            tableRows = [],
            headerContents = [],
            tab,
            myPage;

        for(var i = 0, maxI = doc.pages.length; i < maxI; i+=1)
        {  
            myPage = doc.pages.item(i);
            try{ 
                myTF = myPage.textFrames.item('printTableFrame');
                var check = myTF.name;
                if (myTF.tables.length > 0) {
                    tab = myTF.tables.item(0)
                }
            } catch (e) {continue} //continue with next page if no printTableFrame is found


            //get contents of the header row
            var myRow,
                myCell,
                rowContents,
                maxCells = 0;
               
            for(var r = 0, maxR = tab.rows.length; r < maxR; r+=1) 
            {
                myRow = tab.rows.item(r);
                maxCells = myRow.cells.length > maxCells ? myRow.cells.length : maxCells;
                rowContents = [];
                
                //if the row contains less then 8 cells, fill the missing contents from the last added rowContents
                if(myRow.cells.length < maxCells) {
                    var maxL = maxCells - myRow.cells.length;
                    for(var l=0; l<maxL; l+=1){
                        rowContents.push(tableRows[tableRows.length-1][l]);
                    }
                }

                for(var c = 0, maxC = myRow.cells.length; c < maxC; c += 1) {
                    myCell = myRow.cells.item(c);           
                    rowContents.push(myCell.contents)
                }

                //if its the first row, its the header of the table
                //then overwrite the first tableRows entry since its always the same on all pages
                if(r==0) {
                    tableRows[r] = rowContents;
                } else {
                    tableRows.push(rowContents);
                }
                
            }
        }
        return tableRows;
    },
    
    generate_wawi_strings : function (rowContents)
    {
        var resStrings = [],
            texString,
            wawiString,
            myRow,
            heads = rowContents[0];
        for(var i = 1, maxI = rowContents.length; i < maxI; i+=1)
        {               
            conts = rowContents[i];         
            
            texString  = conts[0];  // Stückzahl
            texString += 'x ';               
            texString += conts[1];  // Artikel
            texString += ' in ';
            texString += conts[2];  // Farben
            texString += ' - Druckposition: ';
            texString += conts[3];  // Druckposi

            wawiString  = 'Produktionsdetails --> ';
            wawiString += conts[6] == 'Siebdruck' ? 'Druckfarben (~ Pantone C): ' : 'Druckfarben: ';
            wawiString += conts[7];
            wawiString += ' - Druckbreite: ca. ';
            wawiString += conts[4]/10;
            wawiString += ' cm - Motiv: ';
            
            myRow = {
                tex : texString,
                wawi : wawiString
            }
        
            resStrings.push(myRow);
        }
        return resStrings;
    },
    
    create_ui : function (rowObjs, job)
    {
        var dialogName = "WaWi Infos nachtragen zu ->  ";
            dialogName += job ? job.nfo.jobNr + ' - ' + job.nfo.client : 'irgendeinem bekloppten Auftrag';
        
        var myDialog = app.dialogs.add({name:dialogName});
        with(myDialog){
            with(dialogColumns.add()){          
                for(var i = 0; i < rowObjs.length; i++){
                    with(borderPanels.add()){                   
                        with(dialogRows.add()){
                            staticTexts.add({staticLabel:rowObjs[i].tex, minWidth:750, staticAlignment: StaticAlignmentOptions.LEFT_ALIGN});
                        }
                        with(dialogRows.add()){
                            var myTextEditField = textEditboxes.add({editContents:rowObjs[i].wawi, minWidth:750});
                        }                           
                    }                       
                }
            }               
        }

        //Show the dialog box.
        var myResult = myDialog.show();
        //If the user clicked OK, display one message;
        //if they clicked Cancel, display a different message.
        //Remove the dialog box from memory.
        myDialog.destroy();
    },

    create_wawi_string_dialog : function (rowObjs, job) {
        var result = null;
        var dialogTitle;
        dialogTitle = "WaWi Infos nachtragen zu ->  ";
        dialogTitle += job ? job.nfo.jobNr + ' - ' + job.nfo.client : 'irgendeinem bekloppten Auftrag';

        var win = new Window ('dialog', dialogTitle);
        win.alignChildren = 'fill';
            var aPnl;
            for(var i = 0; i < rowObjs.length; i++){
                aPnl = win.add('panel', undefined, '');
                aPnl.alignChildren = 'fill';
                aPnl.add('statictext', undefined, rowObjs[i].tex);
                aPnl.add('edittext', undefined, rowObjs[i].wawi);
            }
        
        win.add('button', undefined, 'Cancel');

        win.show();
    },   

    create_hinweis_frame : function (hwStr) 
    {
        var myPage = app.activeWindow.activePage,
            doc = myPage.parent.parent,
            internLayer = doc.layers.item('Intern');

        doc.activeLayer = internLayer;

        try {
            myTF = myPage.textFrames.item('hinweisFrame');
            var check = myTF.name;
        } catch (e) {
            var tFBounds = doc.masterSpreads.item('A-FixedStuff').pageItems.item('hinweisFrame').geometricBounds;
            var myTF = myPage.textFrames.add({geometricBounds:tFBounds, itemLayer:internLayer, name: 'hinweisFrame'});
            myTF.appliedObjectStyle = doc.objectStyles.item('hinweisFrameStyle');
        }
        myTF.contents = hwStr;
        myTF.paragraphs.item(0).applyParagraphStyle(doc.paragraphStyles.item('hinweisTextStyle'));
        return myTF;
    },

    add_stand_listener : function (turnOn) 
    {
        var doc = app.activeDocument;
        var myPage = app.activeWindow.activePage;
        var l = doc.layers.item('Infos');

        doc.removeEventListener("afterSelectionAttributeChanged", new File('/c/capri-links/scripts/includes/myStandListener.jsx'));
        if(turnOn) doc.addEventListener("afterSelectionAttributeChanged", new File('/c/capri-links/scripts/includes/myStandListener.jsx'));
    },

    remove_stand_listener : function() 
    {
        var doc = app.activeDocument;
        var myPage = app.activeWindow.activePage;
        var l = doc.layers.item('Infos');

        doc.removeEventListener("afterSelectionAttributeChanged", new File('/c/capri-links/scripts/includes/myStandListener.jsx'));                
    },
};