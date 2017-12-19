function MonoTable (initPage) {
    
    var init = function (myPage) {
        if(myPage) {
            myDoc = myPage.parent.parent;
            myLayer = myDoc.layers.itemByName('Infos');
            docScale = myDoc.documentPreferences.pageWidth/ 297;
            myTable = get_table(myPage);
        }
    };

    var resize_column = function (myColumn, newWidth) {
        var myTable = myColumn.parent;
        var deltaW = myColumn.width - newWidth;
        myColumn.width = newWidth;
        
        var getIndex = function (myColumn) {
            for (var i = 0, maxI = myColumn.parent.columns.length; i < maxI; i+=1) {
                if(myTable.columns.item(i) === myColumn) {
                    return i
                };
            };
        };

        var index = getIndex(myColumn);

        for (var i = index+1, maxI = myTable.columns.length; i < maxI ; i+=1) {
            var otherColumn = myTable.columns.item(i);
            otherColumn.width += deltaW/(myTable.columns.length - 1 - index);
        };
    };

    var get_table = function (myPage) {
        try {
            var myTF = myPage.textFrames.item('printTableFrame');
            var check = myTF.name;
            var myTable = myTF.tables.item(0);
            check = myTable.name;
            return myTable;
        } catch(e) {
            return null;
        }
    };

    var create_table = function (myPage) {
        
        myTable = get_table(myPage);
        if(myTable && myTable.name)myTable.remove();
        
        var tFBounds = myDoc.masterSpreads.item('A-FixedStuff').pageItems.item('printTabFrame').geometricBounds;
        var myTF = myPage.textFrames.add({geometricBounds:tFBounds, itemLayer:myLayer, name: 'printTableFrame'});
        
        myTF.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN; 
        myTF.contents = tableInitString;
        myTF.texts.item(0).convertToTable();
        myTable = myTF.tables.item(0);
        myTable.name = 'filmInfosTable';

    
        return myTable;
    };

    var sum_array = function (array) {
        var total = 0;
        for (var i = 0; i < array.length; i++) {
            total += Number(array[i]);
        }
        return total;
    };
    
    var style_table = function (myTable) {
        var headerRow = myTable.rows.item(0);
        headerRow.rowType = RowTypes.HEADER_ROW;
        headerRow.cells.everyItem().appliedCellStyle = myDoc.cellStyles.item('headerCellStyle');

        myTable.appliedTableStyle = myDoc.tableStyles.item('defaultTStyle');        
        myTable.alternatingFills = AlternatingFillsTypes.ALTERNATING_ROWS;
        
        var totalWidth = myTable.parent.geometricBounds[3]-myTable.parent.geometricBounds[1];
        switch (docScale) {
            case 4.5 : // for bags
                var columnWidths = [6, 12, 15, 10, 10, 15, 10, 22, 5];
                break;
                        
            default :  //for shirts
                var columnWidths = [6, 14, 15, 10, 10, 17, 10, 22, 5];
        }
        
        var sum = sum_array(columnWidths);
        for(var i = 0; i < columnWidths.length; i++) {
            if(columnWidths[i] != undefined) {
                var colWidth = totalWidth * columnWidths[i] / sum;
                resize_column(headerRow.columns.item(i), colWidth);
            }
        }

        var myRow = myTable.rows.item(1);
        myRow.cells.everyItem().appliedCellStyle = myDoc.cellStyles.item('defaultCellStyle');
        myRow.cells.everyItem().autoGrow = true;

        return myTable;
    };

    var get_row_by_id = function(id) {
        if(!myTable) return null;
        var cellIndex = columnOrder.id;
        for (var i = 0; i < myTable.rows.length; i++) {
            if(myTable.rows[i].cells[cellIndex].contents == id) {
                return myTable.rows[i];
            }
        }
        return null;
    };

    var make_standString = function (rC) {
        var stand = (rC.stand + rC.height)<0 ? rC.stand-rC.height : rC.stand;
        var roundedCM = roundHalf(stand*0.1);
        var standString = 'ca. ';
        if(stand > 0) {
            standString += roundedCM + ' cm unter der';
            standString += docScale == 6.5 ? ' Kragennaht' : ' Taschenöffnung';
        } else if (stand < 0) {
            standString += Math.abs(roundedCM) + ' cm über der Markierung';
        }
        return standString;
    };

    var update_standString = function (rC, oldRC) {
        var stand = (rC.stand + rC.height)<0 ? Math.abs(rC.height+rC.stand) : rC.stand;
        var roundedCM = roundHalf(stand*0.1);
        var match = oldRC.stand.match(/(ca\.)\s(\d{1,2}\.?,?5?)\s?(.+)/i);

        if(match) {
            if(stand < 0) {
                var tail = match[3].replace('unter', 'über');
            } else {
                var tail = match[3].replace('über', 'unter');
            }
            var updatedString = ''
            updatedString += match[1] + ' ';
            updatedString += Math.abs(roundedCM) + ' ';
            updatedString += tail;
            return updatedString;
        } else {
            return oldRC.stand.replace(/\d{1,2}\.?,?5?/, stand);
        }        
    };

    var write_nfo_to_row = function (myRow, rowContents) {

        myRow.cells.everyItem().appliedCellStyle = myDoc.cellStyles.item('defaultCellStyle');
        myRow.cells.everyItem().autoGrow = true;

        for (var p in rowContents) {
            if(rowContents.hasOwnProperty(p) && rowContents[p] != '') {
                if(columnOrder.hasOwnProperty(p)) {
                    var myCell =  myRow.cells.item(columnOrder[p]);
                    if(myCell.isValid) {
                        myCell.contents = rowContents[p].toString();
                    } else {
                        $.writeln('could not write to cell: ' + p);
                    }               
                }
            }
        }        
    };

    var read_nfo_from_row = function (myRow) {
        var rowContents = {};
        for(var p in columnOrder) {
            if(columnOrder.hasOwnProperty(p)) {
                var myCell = myRow.cells.item(columnOrder[p]);
                if(myCell.isValid) {
                    rowContents[p] = myCell.contents;
                } else {
                    rowContents[p] = '';
                }
            }
        }
        return rowContents;
    };

    var roundHalf = function (num) {
        num = (Math.round(num*2))/2;
        return num;
    };

    var read_monoGraphic = function (monoGraphic) {
        var rC = {};
        var monoNamer = new MonoNamer();
        
        rC.textilName = monoGraphic.get_textil_name();
        rC.textilColor = monoGraphic.get_textil_color();
        rC.printId = monoNamer.name('printId', monoGraphic.get_printId());
        rC.width = monoGraphic.get_width().toFixed(0);
        rC.height = monoGraphic.get_height().toFixed(0);
        rC.stand = monoGraphic.get_stand();
        rC.tech = monoNamer.name('tech', monoGraphic.get_tech());
        rC.colors = monoGraphic.get_colors().join(', ');
        rC.id = monoGraphic.get_id();

        return rC;
    };

    var style_rowContents = function (rC) {
        rC.stand = make_standString (rC);
        rC.width = rC.width.toFixed(0);
        rC.height = rC.height.toFixed(0);
        return rC;
    };

    var get_user_input = function (rowContents) {
        var result = {};
        var rC = rowContents;
        var win = new Window('dialog', 'Textilangaben:');

        //win.textilPanel = win.add('panel', [0, 0, 400, 110], "verwendeter Artikel und Farbe(n):");
        win.textilPanel = win.add('panel', undefined, "verwendeter Artikel und Farbe(n):");

        win.textilPanel.textil      = win.textilPanel.add("edittext", [5, 10,  390, 35], rC.textilName, { enterKeySignalsOnChange : true });
        win.textilPanel.color       = win.textilPanel.add("edittext", [5, 40,  390, 65], rC.textilColor, { enterKeySignalsOnChange : true });
        win.textilPanel.run         = win.textilPanel.add("edittext", [5, 70,  390, 95], '000', { enterKeySignalsOnChange : true });
        win.textilPanel.beidseitig  = win.textilPanel.add("checkbox", [5, 100, 390, 125], 'Textil beidseitig bedrucken',{enabled:true});
        win.textilPanel.hinweis     = win.textilPanel.add("edittext", [5, 130, 390, 155], 'Hinweise', { enterKeySignalsOnChange : true });

        win.quitBtn = win.add('button', [120,275,200,295], 'Fertig');

        win.quitBtn.onClick = function() {
            rC.textilName = win.textilPanel.textil.text;
            rC.textilColor = win.textilPanel.color.text;
            rC.run = win.textilPanel.run.text;
            rC.beidseitig = win.textilPanel.beidseitig.value;
            rC.hinweis = win.textilPanel.hinweis.text != 'Hinweise' ? win.textilPanel.hinweis.text : null;                
            win.close();
        };

        win.show();
        return rC;
    };

    var choose_id_dialog = function (rows) {
        var w = new Window ("dialog");
        w.alignChildren = "fill";
        w.add("statictext", undefined, "keine passende Tabellenzeile gefunden.\rNeue Zeilen ID wählen:");
        var radio_group = w.add ("panel");
        radio_group.alignChildren = "left";
        for (var i = 0; i < rows.length; i++) {
            radio_group.add ("radiobutton", undefined, rows[i].cells.item(columnOrder['id']).contents);
        }
        
        w.add ("button", undefined, "OK");
        // set dialog defaults
        radio_group.children[0].value = true;
        function selected_rbutton (rbuttons) {
            for (var i = 0; i < rbuttons.children.length; i++) {
                if (rbuttons.children[i].value == true) {
                    return i;
                }
            }
        }
        if (w.show () == 1) {
            return rows[selected_rbutton (radio_group)];
        }
    }

    var update_row_id = function (newID) {
        var rows = [];
        for (var i = 1; i < myTable.rows.length; i++) {
            rows.push(myTable.rows[i]);
        }

        var selectedRow = choose_id_dialog(rows);
        if(selectedRow) {
            selectedRow.cells.item(columnOrder['id']).contents = newID.toString();
            return selectedRow;
        }
        return null;
    };

    var columnOrder = {
        run : 0,
        textilName : 1,
        textilColor : 2,
        printId : 3,
        width : 4,
        stand : 5,
        tech : 6,
        colors : 7,
        id: 8
    };
    
    var myDoc;
    var myLayer;
    var docScale;
    var myTable;
    var tableInitString = 'Menge:\tArtikel:\tFarbe(n):\tPosition:\tBreite (mm):\tDruckstand:\tVerfahren:\tDruckfarben:\tId:\r';
    var lastRowContents;

    if(initPage && initPage.constructor.name == 'Page') init(initPage);

	/* Public API
	------------------------------------------*/
	return {
		create_table : function (page, reset) {
            if(myTable && !reset) return myTable;

			var myTable = create_table(page, true);
			return style_table(myTable);
		},

        add_row : function (monoGraphic) {
            if(!myTable) return null;
            var rowContents = read_monoGraphic(monoGraphic);
            if(lastRowContents && lastRowContents.beidseitig) {
                rowContents.run = '';
                rowContents.textilName = '';
                rowContents.textilColor = ''; 
            } else {
                rowContents = get_user_input(rowContents);
            }
            
            rowContents.stand = make_standString (rowContents);
            
            var lastRow = myTable.rows.lastItem();
            if(lastRow.contents.join('') == '') {
                var myRow = lastRow;
            } else {                
                var myRow = myTable.rows.add(LocationOptions.AT_END, undefined, {name:monoGraphic.get_id()});
            }
            
            write_nfo_to_row(myRow, rowContents);
            lastRowContents = rowContents;
        },

        read_rows : function () {
            if(!myTable) return null;
            var rowContents = [];
            for (var i = 1; i < myTable.rows.length; i++) {
                var rC = read_nfo_from_row(myTable.rows[i])
                rowContents.push(rC);
            }
            return rowContents;
        },

        update_stand : function (monoGraphic) {
            if(!myTable) return null;
            if(!monoGraphic) return null;
            
            var id = monoGraphic.get_id();            
            
            var myRow = get_row_by_id(id);
            if(!myRow) {myRow = update_row_id(id);}
            if(!myRow) return;
            
            var oldContents = read_nfo_from_row(myRow);
            var rC = {
                height : monoGraphic.get_height().toFixed(0),
                width : monoGraphic.get_width().toFixed(0),
                stand : monoGraphic.get_stand(),
            };
            rC.stand = update_standString(rC, oldContents);
            
            myRow.cells.item(columnOrder['stand']).contents = rC.stand;
            myRow.cells.item(columnOrder['width']).contents = rC.width;
        },

        update_row : function (monoGraphic, getUserInput) {
            if(!myTable) return null;
            if(!monoGraphic) return null;
            var newContents = read_monoGraphic(monoGraphic);
            if(getUserInput) {
                newContents = get_user_input(newContents);
            }

            var myRow = get_row_by_id(newContents.id);
            if(myRow) {
                var oldContents = read_nfo_from_row(myRow);
                newContents.stand = update_standString(newContents, oldContents);
                write_nfo_to_row(myRow, newContents);
            }
        }
	}
}