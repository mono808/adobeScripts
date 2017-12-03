var f_ai_sep = {

    delete_underbase : function (itemsToCheck, ub_color) 
    {
        var doc = app.activeDocument,
            i,
            pI,
            remainingItems = [];
       
        i = itemsToCheck.length -1;
        do {
            //delByColor(itemsToCheck[i]);
            pI = itemsToCheck[i];
            if(pI.fillColor.spot.name === ub_color.spot.name) {
                //items2Delete.push(myPageItem);                    
                pI.remove();
            } else {
                remainingItems.push(pI);
            }
        } while(i--);

        return remainingItems;
    },

    get_sep_coordinates : function ()
    {
        var doc = app.activeDocument,
            abRect = doc.artboards[0].artboardRect,
            xRef = doc.pageItems.getByName('xLine').position[0],
            yRef = doc.pageItems.getByName('yLine').position[1],
            dist = {};
        
        dist.x = UnitValue((abRect[0] - xRef), 'pt');
        dist.y = UnitValue((yRef - abRect[1]), 'pt');
        return dist;
    },

    change_fillColor : function (itemsToCheck, oldSpot, newSpot) 
    {
        var tempColor = new SpotColor(),       
            i = null,
            pI = null, //pathItem
            tintValue = null,
            remainingItems = [];

        tempColor.spot = newSpot;

        i = itemsToCheck.length-1;
        do {
            pI = itemsToCheck[i];
            if (pI.fillColor.spot === oldSpot) {
                tintValue = pI.fillColor.tint
                pI.fillColor = tempColor;
                pI.fillColor.tint = tintValue;
            } else {
                remainingItems.push(pI);
            }
        } while(i--);

        return remainingItems;
    },

    //creates a colored blob, so user can visually see the pantone color that is going to be renamed
    create_colored_blob : function (spotColor)
    {
        app.redraw();
        var doc = app.activeDocument,
            tempColor = new SpotColor(),
            cP, zf, size, blob;
            
        try {
            cP = doc.activeView.centerPoint;
            zf = doc.activeView.zoom;
            size = 500/zf;            
        } catch (e) {
            cP = [0,0];
            zf = 1;
            size = 500/zf;
            $.writeln('Illu PARMED, again... =/');
        }   
        blob = doc.pathItems.ellipse(cP[1]+size/2,  cP[0]-size/2,  size,  size);
        
        tempColor.spot = spotColor;
        blob.fillColor = tempColor;
        blob.stroked = false;
        return blob;
    },

    ask_user_for_new_colorname : function  (spotColor, txtName) 
    {
        var blob = this.create_colored_blob(spotColor),
            presetStr = txtName ? txtName : 'Farbe X';
        app.redraw();
        var newName = String (Window.prompt ('Farbname für: ' + spotColor.name , presetStr, "mono's Pantone ReNamer"));
        blob.remove();
        return newName + ' ';
    },

    get_pantone_txt : function (panNr) 
    {
        var check = panNr.match(/\d{3,4}/);
        if(check.length > 0) {
            var nr = Number(check[0]),
                read_file = mofi.file('pantones');

            read_file.open('r', undefined, undefined);
            read_file.encoding = "UTF-8";      
            read_file.lineFeed = "Windows";

            if (read_file !== '') {
                var panStr = read_file.read(),
                    splitStr = panStr.split('\n'),
                    panArr = [],                    
                    aColorArr = null,
                    i = null,
                    maxI = null;

                for(i=0, maxI = splitStr.length; i < maxI; i+=1) {
                    if(splitStr[i].indexOf('=') > -1) {
                        aColorArr = splitStr[i].split('=');
                        panArr[aColorArr[0]] = aColorArr[1];                
                    }
                }            
                
                read_file.close();                
                return panArr[nr];
            }
        }
    },

    add_to_pantone_txt : function (pantoneStr)
    {
        var append_file = mofi.file('pantones')
            pS = pantoneStr,
            color = pS.substring(0, pS.indexOf(' ')),
            nArr = pS.match(/\d{3,4}/),
            nr = nArr[nArr.length-1],
            appendStr = '\n';
            
        appendStr += nr;
        appendStr += '=';
        appendStr += color;

        var out;
        if (append_file !== '') {
            out = append_file.open('a', undefined, undefined);
            append_file.encoding = "UTF-8";
            append_file.lineFeed = "Windows";
        }

        if (out !== false) {
            if(append_file.write(appendStr)) {
                $.writeln(color + ' ' + nr + ' added to TXT');
                return true;
            } else {
                $.writeln('Could not add Pantone to TXT');
                return false;
            }
            append_file.close();
        }
    },

    rename_pantone_colors : function (itemsToCheck) 
    {
        var panSpots = [], //spotcolors with default PANTONE name
            doc = app.activeDocument,
            i = null,
            maxI = null,
            spot = null,
            pantoneRegEx = /PANTONE/;
        
        for (i = 0, maxI = doc.spots.length; i < maxI; i+=1) {
            spot = doc.spots[i];
            if(pantoneRegEx.test(spot.name)) { 
                spot.name = spot.name.replace('PANTONE ', '');
                panSpots.push(spot);
            }
        }

        var panSpot = null,
            nrOnlyRE = /^\d{3,4}\s(C|U)$/i,
            panNr = null,
            userName = null,
            txtName = null,
            renamedSpot = null;

        for (i = 0, maxI = panSpots.length; i < maxI; i+=1) {
            panSpot = panSpots[i];
            panNr = nrOnlyRE.exec(panSpot.name);
            
            // if stripped spotName contains only sth like 574 C, let user name the color
            if (panNr && panNr.length > 0) {
                txtName = this.get_pantone_txt(panNr[0]);
                userName = this.ask_user_for_new_colorname(panSpot, txtName);
                userName += panNr[0];
                if(!txtName) {
                    this.add_to_pantone_txt(userName)
                };
                panSpot.name = userName;
            }
            // if pantone name does not contain number, it normally already is a descriptive name
            // just remove 'PANTONE' then
            // } else {
            //     userName = panSpot.name;
            // }

            // renamedSpot = doc.spots.add();
            // renamedSpot.colorType = ColorModel.SPOT;
            // renamedSpot.color = panSpot.color;
            // renamedSpot.name = userName;

            // if(itemsToCheck.length > 0) {
            //     itemsToCheck = this.change_fillColor(itemsToCheck, panSpot, renamedSpot);    
            // }
        
            // panSpot.remove();
        }
    },

    change_spot_to_process_colors : function (sepItems) 
    {
        // converts spot colors back to process colors for safer display in mockups / print
        var myDoc = app.activeDocument,
            i,
            sortedPathItems = {},
            pathI,
            fC,
            fCName;

        // sort pathItems by fillColor
        i = sepItems.length-1;
        do {
            pathI = sepItems[i];
            if(pathI.fillColor.constructor.name == 'SpotColor') {
                fC = pathI.fillColor;
                fCName = fC.spot.name;
                if(!sortedPathItems.hasOwnProperty(fCName)) {
                    sortedPathItems[fCName] = {};
                    sortedPathItems[fCName].fillColor = fC;
                    sortedPathItems[fCName].items = [];
                    sortedPathItems[fCName].items.push(pathI);              
                } else {
                    sortedPathItems[fCName].items.push(pathI);
                }
            }
        } while(i--);

        // go through swatches and check if there are sorted pathitems with this color
        // create new process color based on spot colorvalues
        // switch fillcolor of pathitems with new process color
        var mySwatch,
            oldColor,
            newColor;
        var j, sameColorPIs;

        i = myDoc.swatches.length-1;
        do {
            mySwatch = myDoc.swatches[i];
            if( mySwatch.color.constructor.name === 'SpotColor' &&
                mySwatch.color.spot.name !== '[Passermarken]') 
            {
                if(sortedPathItems.hasOwnProperty(mySwatch.name)) 
                {
                    oldColor = mySwatch.color.spot.color;
                    switch(oldColor.constructor.name) 
                    {
                        case 'RGBColor' : 
                            newColor = new RGBColor();
                            newColor.red = oldColor.red;
                            newColor.green = oldColor.green;
                            newColor.blue = oldColor.blue;
                        break;
                        case 'CMYKColor' :
                            newColor = new CMYKColor();
                            newColor.cyan = oldColor.cyan;
                            newColor.magenta = oldColor.magenta;
                            newColor.yellow = oldColor.yellow;
                            newColor.black = oldColor.black;
                        break;
                    }
                    
                    mySwatch.color = newColor;

                    sameColorPIs = sortedPathItems[mySwatch.name].items;
                    j = sameColorPIs.length-1;
                    do {
                        pathI = sameColorPIs[j];
                        pathI.fillColor = mySwatch.color;
                    } while (j--);
                } else {
                    mySwatch.remove();
                }
            }
        } while(i--);
    },

    check_sep_for_nonspot_items : function (sep_report, calculateArea)
    {
        var sr = sep_report,
            i,
            pI,
            retval,
            ubRegEx = /^(UB|UL|Unterleger|Vordruck)$/;


        //if(sr.items.length < 1) {return;}
        
        //check PathItems
        if(sr.items.length > 0) {
            i = sr.items.length-1;
            do {
                pI = sr.items[i];
                // check fillcolor for spot / nonspot color
                switch(pI.fillColor.constructor.name) {
                    case 'GrayColor' :
                    case 'LabColor' :
                    case 'RGBColor' :
                    case 'CMYKColor' :
                    case 'PatternColor' :
                        sr.nonSpotFills.push(pI);
                        if(pI.stroked && pI.strokeColor.constructor.name === 'SpotColor') {
                            sr.spotStrokes.push(pI);
                        }
                    break;                       
                    case 'SpotColor' :
                        if(calculateArea) f_ai_sep.areaCalc.add(pI);
                        // check if spotColor is an underbase color
                        if(ubRegEx.test(pI.fillColor.spot.name)) {
                            sr.ub_color = pI.fillColor;
                        }

                        // if pI has a stroke and is filled with sth. other than underbase spotcolor
                        // check the stroke too
                        if (pI.stroked &&
                            pI.strokeColor.constructor.name !== 'NoColor' &&
                            pI.fillColor.spot.name !== 'Unterleger' &&
                            pI.fillColor.spot.name !== 'UB-Grey') 
                        {
                            if(pI.strokeColor.constructor.name === 'SpotColor') {
                                sr.spotStrokes.push(pI);
                            } else {
                                sr.nonSpotStrokes.push(pI);
                            }
                        }                
                    break;
                }
            } while (i--);
        }

        if(sr.rasterItems.length > 0) {
            i = sr.rasterItems.length-1;
            var rI;
            do{
                rI = sr.rasterItems[i];
            
            } while (i--);
        }

        if(calculateArea) sr.colorAreas = this.areaCalc.report_all();

        return sr;
    },

    areaCalc : 
    {
        colorAreas : {},
        f : Number(0.352778*0.352778/100), //squarepoints to mm² to cm²

        add : function (pI) 
        {
            var validName = pI.fillColor.spot.name.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
                cAs = this.colorAreas;

            if(cAs.hasOwnProperty(validName)) {
                cAs[validName] -= pI.area;
            } else {
                cAs[validName] = 0;
                cAs[validName] -= pI.area;
            }
        },

        report_all : function() 
        {
            var cAs = this.colorAreas,
                cA,
                cmAs = {},
                i,                                            
                totalArea = 0;
            for(i in cAs) {
                if(cAs.propertyIsEnumerable(i)){                    
                    cA = cAs[i];
                    totalArea += cA;
                    cA = Number((cA*this.f).toFixed(0));
                    $.writeln('Color ' + i + ' has an area of: ' + cA + ' cm²');
                    cAs[i] = cA;
                }
            }
            totalArea = Number((totalArea*this.f).toFixed(0));
            cAs['totalArea'] = totalArea;
            $.writeln('Total area is: ' + totalArea + ' cm²');
            return cAs;
        },

        get_area : function (color) 
        {
            var validName = pI.fillColor.spot.name.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
                cAs = this.colorAreas;
            if(cAs.propertyIsEnumerable(validName)) {
                cA = cAs[validName];
                cA = Number((cA*this.f).toFixed(0));
                $.writeln('Color ' + validName + ' has an area of: ' + cA + ' cm²');
                return cA;
            } else {
                $.writeln('Color ' + validName + ' not found, area: 0 cm²');
                return 0;
            }
        },

        get_total : function() 
        {
            var i, cA, totalArea = 0,
                cAs = this.colorAreas;
            for(i in cAs) {
                if(cAs.propertyIsEnumerable(i)) {
                    cA = cAs[i]
                    totalArea += cA;
                }
            }

            totalArea = Number((totalArea*factor).toFixed(0));
            $.writeln('Total coverage = ' + totalArea + ' cm²');
            return totalArea;
        },
    }
}