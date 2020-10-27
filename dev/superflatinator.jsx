#target illustrator

function get_all_art_pathItems(myDoc) {
    var artSelection = [],
        i = myDoc.pathItems.length-1,
        pI;

    do {
        pI = myDoc.pathItems[i];
        if (pI.locked === false && pI.hidden === false && pI.clipping === false) {
            if(pI.filled) {
                artSelection.push(pI);
            } else {
                pI.remove();
            }                
        }
    } while (i--);

    return artSelection;
}

function get_all_inbound_pI(pgI) {
    switch (pgI.constructor.name) {
        case 'PathItem' :
            if (pgI.locked === false && pgI.hidden === false && pgI.clipping === false) {
                if(pgI.filled) {
                    return pgI;
                } else {
                    pgI.remove();
                    return null;
                }
            }
        break;
        case 'CompoundPathItem' :
            var i = pgI.pathItems.length-1, tempPI, pIs = [];
            do {
                tempPI = get_all_inbound_pI(pgI.pathItems[i]);
                if(tempPI) {
                    pIs.push(tempPI);
                }
            } while(i--);
            return pIs;
        break;
        default :
            alert(pgI.constructor.name);
        break;
    }   
}

function get_all_pIs_on_layer (layer) {
    var pgIs = layer.pageItems,
        pIs = [],
        i = pgIs.length - 1,
        tempPI;
    do {
        tempPI = get_all_inbound_pI(pgIs[i]);
        if(tempPI) pIs = pIs.concat(tempPI);
    } while(i--)
    
    return pIs;
}

function calculate_lightness(col) {
    switch(col.constructor.name) {
        case 'RGBColor' : 
            return (col.red+col.green+col.blue)/765;
        break;
        case 'CMYKColor' :
            if(col.black === 100) {
                return 0;
            } else {
                return (300-col.cyan-col.magenta-col.yellow-col.black)/300;
            }
        break;
        case 'GrayColor' :
            return (100-col.gray)/100;
        break;
    }
}

function match_RGBColors(col1, col2) {

    return (
        col1.red.toFixed(0) == col2.red.toFixed(0) &&
        col1.green.toFixed(0) == col2.green.toFixed(0) &&
        col1.blue.toFixed(0) == col2.blue.toFixed(0)
    )
}

function match_CMYKColors(col1, col2) {

    return (  
        col1.cyan.toFixed(0) == col2.cyan.toFixed(0) &&
        col1.magenta.toFixed(0) == col2.magenta.toFixed(0) &&
        col1.yellow.toFixed(0) == col2.yellow.toFixed(0) &&
        col1.black.toFixed(0) == col2.black.toFixed(0)
    ) 
}

function match_GrayColors(col1, col2) {
    return (
        col1.gray.toFixed(0) == col2.gray.toFixed(0)
    )
}

function add_colorSelection(modeSelection, pI, pIColor) {
    var colorSelection = {
        area : 0-pI.area,
        pathItems : [pI],
        color : pIColor,
        lightness : calculate_lightness(pIColor)
    };
    modeSelection.push(colorSelection);
}

function sort_pathItems_by_color(artSelection) {

    var modeSelections = {};

        modeSelections.rgb = [];
        modeSelections.rgb.match = match_RGBColors;
        modeSelections.cmyk = [];
        modeSelections.cmyk.match = match_CMYKColors;
        modeSelections.gray = [];
        modeSelections.gray.match = match_GrayColors;

    // go through all pathItems
    var
        modeSelection,
        existingColorSelection,
        i = artSelection.length - 1,
        maxI,
        pI,
        pIColor,
        colors_match;

    do {
        pI = artSelection[i];
        colors_match = false;

        //sort the pathItems according to fillColor.colormode
        switch(pI.fillColor.constructor.name) {
            case 'SpotColor' :
                pIColor = pI.fillColor.spot.color;
                switch(pIColor.constructor.name) {
                    case 'RGBColor' :
                        modeSelection = modeSelections.rgb;
                    break;
                    case 'CMYKColor' :
                        modeSelection = modeSelections.cmyk;
                    break;
                    case 'GrayColor' :
                        modeSelection = modeSelections.gray;
                    break;
                    default :
                        $.writeln('Found crazy color: ' + pIColor.constructor.name);
                    break;
                }
            break;
            case 'RGBColor' :
                pIColor = pI.fillColor;
                modeSelection = modeSelections.rgb;
            break;
            case 'CMYKColor' :
                pIColor = pI.fillColor;
                modeSelection = modeSelections.cmyk;
            break;
            case 'GrayColor' :
                pIColor = pI.fillColor;
                modeSelection = modeSelections.gray;
            break;
            default :
                $.writeln('Found crazy color: ' + pI.fillColor.constructor.name);
            break;
        }
        
        //if its the first checked pageItem,
        //add a new pageItems-Collection(items with same fillColor) to modeSelections
        var j, maxJ = modeSelection.length;
        if(maxJ < 1) {
            add_colorSelection(modeSelection, pI, pIColor);
            continue;
        }

        // go throug all existing collections in the appropriate modeSelection
        // and check if there is one with the same fillColor.
        for(j = 0; j < maxJ; j += 1) {

            existingColorSelection = modeSelection[j];

            if(modeSelection.match(existingColorSelection.color, pIColor)) {
                existingColorSelection.pathItems.push(pI);
                existingColorSelection.area -= pI.area;
                colors_match = true;
                break;
            }
        }

        // if no matching colorCollection is found, add a new one
        if(!colors_match){
            add_colorSelection(modeSelection,pI, pIColor);
        }

    } while(i--);
    
    return modeSelections;
}

function merge_selections_and_sort_by_lightness(modeSlcts) {
    var p,
        modeSlct,
        colSlct,
        mixedSlcts = [],
        i, maxI;
    
    for(p in modeSlcts) {
        if(modeSlcts.propertyIsEnumerable(p)) {
            if (modeSlcts[p].length > 0 && modeSlct = modeSlcts[p]) {;            
                for(i = 0, maxI = modeSlct.length; i < maxI; i += 1) {
                    colSlct = modeSlct[i];
                    mixedSlcts.push(colSlct);
                }
            }
        }
    }

    mixedSlcts.sort(function(a,b) {
        return (a.area / (a.lightness+0.01)) - (b.area / (b.lightness+0.01));
    } );

    return mixedSlcts;
}

function unite_pathItems (myDoc, slct) {
    
    myDoc.selection = slct;
    app.doScript('Merge', 'ScriptActions');
    var unitedItem = myDoc.selection[0];
    return unitedItem;
}

//check if underbase (and choke) is necessary (by lightness of the colorSelection)

function create_spot_swatch(myDoc, name, rgb) {

    var rgbColor = new RGBColor();
    rgbColor.red = rgb[0];
    rgbColor.green = rgb[1];
    rgbColor.blue = rgb[2];

    // Create Spot
    var spot = myDoc.spots.add();
    spot.color = rgbColor;
    spot.colorType = ColorModel.SPOT;
    spot.name = name;

    // Create new SpotColor using Spot created above and apply a 50% tint
    var spotColor = new SpotColor();
    spotColor.tint = 100; // 50% tint
    spotColor.spot = spot;

    return spotColor;
}

function create_rgb_swatch (myDoc, name, rgb) {

    // Create the new color for the swatch
    var rgbColor = new RGBColor();
    rgbColor.red = rgb[0];
    rgbColor.green = rgb[1];
    rgbColor.blue = rgb[2];

    // Create the new swatch using the above color
    var swatch = myDoc.swatches.add();
    swatch.color = rgbColor;
    swatch.name = name;

    return swatch;
}

function set_fillColor_and_stroke (myDoc, myPageItem, choke) {

    var ubSpot = myDoc.swatches.getByName('Unterleger').color,
        blockOutColor = myDoc.swatches.getByName('BlockOutColor').color; 

    if(myPageItem) {
        var i;
        switch(myPageItem.constructor.name) {
            //if normal pageItem, change fillColor (and if choke also strokeColor)
            case 'PathItem' :
                myPageItem.fillColor = ubSpot;
                if(choke) {
                    myPageItem.stroked = true;
                    myPageItem.strokeColor = blockOutColor;
                    myPageItem.strokeWidth = 0.8;
                    myPageItem.strokeJoin = StrokeJoin.ROUNDENDJOIN;
                    myPageItem.strokeCap = StrokeCap.ROUNDENDCAP;
                } else {
                    myPageItem.stroked = false;
                }
            break;
            // if compoundPathItem, recursively check the contained pathItems
            case 'CompoundPathItem' :            
                i = myPageItem.pathItems.length - 1;
                do {  
                    set_fillColor_and_stroke(myDoc, myPageItem.pathItems[i], choke);
                } while(i--);
            break;
            //if groupItem, recursively check the contained pageItems                    
            case 'GroupItem' :
                i = myPageItem.pageItems.length - 1; 
                do {
                    set_fillColor_and_stroke(myDoc, myPageItem.pageItems[i], choke);
                } while(i--);
            break;
        }
    }
}

function underbase_item(myDoc, myItem, lightness, layersIndex) {
    
    var i = 0, underbaseItem;

    if (lightness >= 0.08) {
        
        underbaseItem = myItem.duplicate(myItem, ElementPlacement.PLACEAFTER);
        
        myDoc.selection = [myItem];
        app.doScript('Set_Overprint', 'ScriptActions');        
        myDoc.selection = [];
        myItem.hidden = true;

        if (lightness <= 0.95) {
            set_fillColor_and_stroke(myDoc, underbaseItem, true);
        } else {
            set_fillColor_and_stroke(myDoc, underbaseItem, false);
        }
        
        myDoc.selection = [underbaseItem];
        while(i < layersIndex) {
            app.doScript('Step_Back', 'ScriptActions');
            i+=1;
        }

        underbaseItem.hidden = true;
    }
           
    myDoc.selection = [];
}

function flatinator () {

	var myDoc = app.activeDocument;

    if(myDoc.placedItems.length > 0) {
        var sepRef = myDoc.placedItems[0];
        if(sepRef.file.name.match(/.eps/)) {
            app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
            sepRef.embed();
            app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
        }
    }
    
    app.doScript('Preparations', 'ScriptActions');

    if(!confirm('Druck noch in Ordnung?')) {
        alert('CTRL+Z und Druck bitte selbst einbetten, dann Script neustarten.');
        return;
    }

    var make_UB = confirm('Unterdruck erstellen?');
    if(make_UB) {
        try {
            var ubSpot = myDoc.swatches.getByName('Unterleger').color;
        } catch (e) {
            var ubSpot = create_spot_swatch(myDoc,'Unterleger', [230,160,200])
        }
        try {
            var blockOutColor = myDoc.swatches.getByName('BlockOutColor').color;
        } catch (e) {
            var blockOutColor = create_rgb_swatch(myDoc, 'BlockOutColor', [255,255,255]);
        }
    }

    var motivLayer = myDoc.layers.getByName('Motiv');
    var artPathItems = get_all_pIs_on_layer(motivLayer);
    //var artPathItems = get_all_art_pathItems(myDoc);
    $.writeln('Found ' + artPathItems.length + ' pathItems');

	var modeSelections = sort_pathItems_by_color(artPathItems);
    $.writeln('Found ' + modeSelections.rgb.length + ' RGB colors');
    $.writeln('Found ' + modeSelections.cmyk.length + ' CMYK colors');
    $.writeln('Found ' + modeSelections.gray.length + ' GRAY colors');
    
    var allSelections = merge_selections_and_sort_by_lightness(modeSelections);

    var i, maxI, colorSelection, mergedItem;
    for (i = 0, maxI = allSelections.length; i < maxI; i += 1) {
        colorSelection = allSelections[i];
        $.writeln("Area: " + colorSelection.area + " - Lightness: " + colorSelection.lightness + " - Value: " + (colorSelection.area/(colorSelection.lightness+0.01)).toFixed(0));
        mergedItem = unite_pathItems(myDoc, colorSelection.pathItems);
        mergedItem.move(mergedItem.layer, ElementPlacement.PLACEATBEGINNING);
        if(make_UB) {
            underbase_item(myDoc, mergedItem, colorSelection.lightness, i);
        }
    }
    app.doScript('Show_All', 'ScriptActions');
}

app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

flatinator();

app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;