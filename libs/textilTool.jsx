var typeahead = require('typeahead');
var paths = require('paths');


var csroot = $.getenv("csroot");
csroot = Folder(csroot).fullName;
var ignoreThoseFiles = /\.bridge/i;
var fixedLayerNames = ["Shirt","Naht","Tasche","Beutel","Hintergrund"];
var texRoot = new Folder(csroot + "/Produktion/Druckvorstufe/textilien");

var doc = app.activeDocument;
var texLayer = doc.layers.item('Textils');
texLayer = texLayer.isValid ? texLayer : doc.activeLayer;
var texFiles;

function find_files (dir, filter) {
    return find_files_sub (dir, [], filter);
}

function find_files_sub (dir, array, filter) {
    var f = Folder (dir).getFiles ("*.*");
    for (var i = 0; i < f.length; i++)
        {
        if (f[i] instanceof Folder)
            find_files_sub (f[i], array, filter);
        else
            if (f[i] instanceof File && f[i].displayName.search(filter) == -1)
                array.push (f[i]);
        }
    return array;
}

function get_tex_files (dir, filter) {
    
    var result = find_files (dir, filter);
    result.sort(function(a,b) {
        return a.displayName.toLowerCase() > b.displayName.toLowerCase();
    })
    return result;
};

function get_tex_folder () {
    var texFolders = texRoot.getFiles (function (a) {return a instanceof Folder});
    var selectedFolders = typeahead.show_dialog(texFolders, 'displayName');
    return selectedFolders;
}

function place_image (parent, image, layer) {
    var placedItemsArray = parent.place(image, undefined, layer);
    if(placedItemsArray) {
        return placedItemsArray[0]
    }
}

function add_textiles(staySelected) {

    var placedItems = [];
    var placedItem;
    // if something is selected,  place image into selected rectangles
    var texFiles = get_tex_files(texRoot, ignoreThoseFiles);
    var selectedTex = typeahead.show_dialog(texFiles, 'displayName', true);
    var targetItems = app.selection;
    targetItems = targetItems.filter(function(item){return item.constructor.name == 'Rectangle' })
    
    var maxT = targetItems.length;
    var t = 0;
    var targetItem;
    for (var j=0, lenJ=selectedTex.length; j < lenJ ; j++) {
        var tex = selectedTex[j];
        if(t < maxT) {
            targetItem = targetItems[t]
            var fitOps = targetItem.frameFittingOptions;
            fitOps.fittingAlignment = AnchorPoint.TOP_CENTER_ANCHOR;
            fitOps.fittingOnEmptyFrame = EmptyFrameFittingOptions.NONE;
            fitOps.autoFit = false;
            targetItem.fit(FitOptions.APPLY_FRAME_FITTING_OPTIONS);

            placedItems.push(place_image(targetItem, tex));
            targetItem.fit(FitOptions.CENTER_CONTENT);
            targetItem.fit(FitOptions.FRAME_TO_CONTENT);

            t++;
        } else {
            placedItems.push(place_image(doc.layoutWindows[0].activePage, tex, texLayer))
        }
    };

    // if nothing is selected, just place selected images onto the page
    if(placedItems && placedItems.length > 0) {
        app.selection = placedItems;
    }
}

function get_graphicLayerNames (myImage, skipHiddenLayers, skipFixedLayers) {
    // get ref to the parent object, otherwise the script will fuckup ...
    var graphicLayers = myImage.graphicLayerOptions.graphicLayers;
    var layerNames = [];
    var gL;

    for (var j=0, lenJ=graphicLayers.length; j < lenJ ; j++) {
        gL = graphicLayers[j];
        var name = gL.name;
        if(skipHiddenLayers && gL.currentVisibility !== true) continue;
        
        if(skipFixedLayers && fixedLayerNames.includes(name)) continue;
        
        layerNames.push(name);
    };

    return layerNames;
}

function changeImage(image, aFile) {
    var rec = image.parent;
    //image.remove();

    if(aFile.constructor.name !== 'File') {
        aFile = new File(decodeURI(aFile));
    }
    rec.place(aFile);
    //rec.fit(FitOptions.CONTENT_TO_FRAME);
    rec.allGraphics[0].itemLink.unlink();
}

function flatten_textiles (mySelection) {
    if(!mySelection || mySelection.length == 0) return;
    var selItem;
    for (var i=0, lenI=mySelection.length; i < lenI ; i++) {
        selItem = mySelection[i];
        if(selItem.constructor.name === 'Rectangle') {
            var graphic = selItem.graphics[0];
        } else {
            var graphic = selItem;
        }

        if(graphic.imageTypeName !== 'Photoshop' && graphic.imageTypeName !== 'PDF') return;

        var visibleOjectLayers = get_graphicLayerNames(graphic);
        var sourcePath = graphic.itemLink.filePath;

        /* create filename containing the visible object layers */
        
        var filename = sourcePath.substring(0, sourcePath.lastIndexOf('.'));
        var sourceExtension = sourcePath.substring(sourcePath.lastIndexOf('.'), sourcePath.length-1);
        var destExtension = '.jpg';
        for (var j=0, lenJ=visibleOjectLayers.length; j < lenJ ; j++) {
            filename += '_-_';
            filename += (encodeURI(visibleOjectLayers[j]));
        };

        var destPath = filename + destExtension;

        var btArgs = {};
        btArgs.sourcePath = encodeURI(sourcePath);
        btArgs.destPath = encodeURI(destPath);
        btArgs.visibleOjectLayers = visibleOjectLayers;

        var jpgFile = new File(decodeURI(destPath));
        
        graphic.exportFile(ExportFormat.JPG, jpgFile, false);
        // var jpgPath = sendScriptToPhotoshop(ps_run, btArgs);

        changeImage(graphic, jpgFile);
        jpgFile.remove();
    }
}

function toggle_graphicLayers (myImage, visibleLayerNames) {
    var rect = myImage.parent;
    var gLO = rect.graphics.item(0).graphicLayerOptions;
    var gL;
    
    for (var k=0, lenK = gLO.graphicLayers.length; k < lenK ; k++) {
        gL = gLO.graphicLayers[k];
        if(!gL.isValid) continue;

        if(visibleLayerNames.includes(gL.name)) {
            if(gL.currentVisibility) continue;
            gL.currentVisibility = true;
            gLO = rect.graphics.item(0).graphicLayerOptions;
        } else {
            if(!gL.currentVisibility) continue;
            gL.currentVisibility = false;
            gLO = rect.graphics.item(0).graphicLayerOptions;
        }
    }
}

function choose_object_layers (selection) {

    if(selection.length < 1) return;

    var isOrContainsImage = function(item) {
        return item.constructor.name === 'Image' || (item.constructor.name === 'Rectangle' && item.graphics.length > 0);
    }

    var filtered = selection.filter(isOrContainsImage);
    var images = filtered.map(function(item){
        if(item.constructor.name == 'Image') return item;
        return item.graphics[0];
    });

    var myImage;
    for (var i = 0; i < images.length; i++) {
        myImage = images[i];

        if (myImage.imageTypeName !== "Photoshop" && myImage.imageTypeName !== "Adobe PDF") continue;
        
        var graphicLayerNames = get_graphicLayerNames(myImage,false, true);
        
        var selectedLayerNames = typeahead.show_dialog(graphicLayerNames, undefined, true);

        var visibleLayerNames = selectedLayerNames ? selectedLayerNames.concat(fixedLayerNames) : fixedLayerNames;
        
        if(visibleLayerNames && visibleLayerNames.length > 0) {
            toggle_graphicLayers(myImage, visibleLayerNames);
        }
    }
}

exports.add_textiles = add_textiles;
exports.choose_object_layers = choose_object_layers;
exports.flatten_textiles = flatten_textiles;