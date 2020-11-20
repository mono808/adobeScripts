var typeahead = require("typeahead");

var csroot = Folder($.getenv("csroot")).fullName;
var ignoreBridge = /^(?!.*(\.bridge)).*$/i;
var fixedLayerNames = ["Shirt", "Naht", "Tasche", "Beutel", "Hintergrund"];
var listAlways = "front|back|left|right|side";
var texRoot = new Folder(csroot + "/Produktion/Druckvorstufe/textilien");

function find_files(dir, filter) {
    return find_files_sub(dir, [], filter);
}

function find_files_sub(dir, array, filter) {
    var f = Folder(dir).getFiles("*.*");
    for (var i = 0; i < f.length; i++) {
        if (f[i] instanceof Folder) find_files_sub(f[i], array, filter);
        else if (f[i] instanceof File && f[i].displayName.search(filter) > -1)
            array.push(f[i]);
    }
    return array;
}

function get_tex_files(dir, filter) {
    var result = find_files(dir, filter);
    result.sort(function (a, b) {
        return a.displayName.toLowerCase() > b.displayName.toLowerCase();
    });
    return result;
}

function place_image(parent, image, layer) {
    var placedItemsArray = parent.place(image, undefined, layer);
    if (placedItemsArray) {
        return placedItemsArray[0];
    }
}

function add_textiles() {
    var doc = app.activeDocument;
    var texLayer = doc.layers.item("Textils");
    texLayer = texLayer.isValid ? texLayer : doc.activeLayer;

    var placedItems = [];
    // if something is selected,  place image into selected rectangles
    var texFiles = get_tex_files(texRoot, ignoreBridge);
    var selectedTex = typeahead.show_dialog(
        texFiles,
        "displayName",
        true,
        "Textilien wählen"
    );

    if (!selectedTex || selectedTex.length < 1) {
        alert("Script cancelled, no textiles to place selected");
        return;
    }

    var targetItems = app.selection;
    targetItems = targetItems.filter(function (item) {
        return item.constructor.name == "Rectangle";
    });

    var maxT = targetItems.length;
    var t = 0;
    var targetItem;
    for (var j = 0, lenJ = selectedTex.length; j < lenJ; j++) {
        var tex = selectedTex[j];
        if (t < maxT) {
            targetItem = targetItems[t];
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
            placedItems.push(
                place_image(doc.layoutWindows[0].activePage, tex, texLayer)
            );
        }
    }

    // if nothing is selected, just place selected images onto the page
    if (placedItems && placedItems.length > 0) {
        app.selection = placedItems;
    }
}

function get_graphicLayerNames(myImage, skipHiddenLayers, skipFixedLayers) {
    // get ref to the parent object, otherwise the script will fuckup ...
    var graphicLayers = myImage.graphicLayerOptions.graphicLayers;
    var layerNames = [];
    var gL;

    for (var j = 0, lenJ = graphicLayers.length; j < lenJ; j++) {
        gL = graphicLayers[j];
        var name = gL.name;
        if (skipHiddenLayers && gL.currentVisibility !== true) continue;

        if (skipFixedLayers && fixedLayerNames.includes(name)) continue;

        layerNames.push(name);
    }

    return layerNames;
}

function replace_graphic(myRect, aFile) {
    if (aFile.constructor.name !== "File") {
        aFile = new File(decodeURI(aFile));
    }
    myRect.place(aFile);
    //myRect.fit(FitOptions.CONTENT_TO_FRAME);
    return myRect;
}

function get_sourcePath(selItem) {
    if (selItem.constructor.name == "Rectangle") {
        return get_sourcePath(selItem.graphics[0]);
    }

    var sourcePath;
    switch (selItem.constructor.name) {
        case "Image":
            sourcePath = selItem.itemLink.filePath;
            break;
        case "PDF":
            sourcePath = selItem.itemLink.filePath;
            break;
        case "Graphic":
            sourcePath = selItem.properties.itemLink.filePath;
            break;
    }
    return sourcePath;
}

function get_filename_from_path(path) {
    return path.substring(path.lastIndexOf("\\") + 1, path.lastIndexOf("."));
}

function toggle_graphicLayers(myGraphic, visibleLayerNames) {
    var rect = myGraphic.parent;
    var gLO = rect.graphics.item(0).graphicLayerOptions;
    var gL;

    for (var k = 0, lenK = gLO.graphicLayers.length; k < lenK; k++) {
        gL = gLO.graphicLayers[k];
        if (!gL.isValid) continue;

        if (visibleLayerNames.includes(gL.name)) {
            if (gL.currentVisibility) continue;
            gL.currentVisibility = true;
            if (!gLO.isValid) gLO = rect.graphics.item(0).graphicLayerOptions;
        } else {
            if (!gL.currentVisibility) continue;
            gL.currentVisibility = false;
            if (!gLO.isValid) gLO = rect.graphics.item(0).graphicLayerOptions;
        }
    }
    return rect.graphics.item(0);
}

function flatten_textiles(myRect, myGraphic) {
    if (myGraphic.imageTypeName === "JPEG") {
        alert("Image is already a JPG, no need to flatten again");
        return;
    }

    var sourcePath = get_sourcePath(myGraphic);
    var jpgFilename = get_filename_from_path(sourcePath);
    jpgFilename += ".jpg";
    var jpgFile = new File("~/documents/adobeScripts/" + jpgFilename);

    myGraphic.exportFile(ExportFormat.JPG, jpgFile, false);
    replace_graphic(myRect, jpgFile);
    myRect.allGraphics[0].itemLink.unlink();
    jpgFile.remove();
}

function reactivate_jpg(myRect, myGraphic) {
    var sourcePath = get_sourcePath(myGraphic);
    var sourceFilename = get_filename_from_path(sourcePath);
    var searchPattern = new RegExp(sourceFilename, "ig");
    var foundTex = get_tex_files(texRoot, searchPattern);

    if (!foundTex || foundTex.length === 0) return;

    var selectedTex;
    if (foundTex.length == 1) {
        selectedTex = foundTex[0];
    } else {
        var multiselect = false;
        selectedTex = typeahead.show_dialog(
            foundTex,
            "displayName",
            multiselect,
            "Textilien wählen"
        );
    }
    replace_graphic(myRect, selectedTex);
    return myRect;
}

function handleSelection(mySelection, func) {
    if (!mySelection || mySelection.length == 0) return;

    for (var i = 0, lenI = mySelection.length; i < lenI; i++) {
        var selectionItem = mySelection[i];
        var myRect, myGraphic;
        if (selectionItem.constructor.name === "Rectangle") {
            myRect = selectionItem;
            myGraphic = myRect.graphics[0];
        } else {
            myGraphic = selectionItem;
            myRect = myGraphic.parent;
        }
        func(myRect, myGraphic);
    }
}

function choose_object_layers(myRect, myGraphic) {
    var imageTypes = ["Adobe PDF", "Photoshop"];

    $.writeln("choosing object layers on " + myGraphic.constructor.name);

    if (myGraphic.imageTypeName === "JPEG") {
        $.writeln("switching embedded jpg with layered linked graphic");
        reactivate_jpg(myRect, myGraphic);
        myGraphic = myRect.graphics[0];
    }

    if (!imageTypes.includes(myGraphic.imageTypeName)) {
        $.writeln("cant choose object layers on " + myGraphic.constructor.name);
        return null;
    }

    var graphicLayerNames = get_graphicLayerNames(myGraphic, false, true);

    //inputElements, propertyToList, multiselect, dialogTitle, listAlways
    var selectedLayerNames = typeahead.show_dialog(
        graphicLayerNames,
        undefined,
        true,
        undefined,
        listAlways
    );

    var visibleLayerNames = selectedLayerNames
        ? selectedLayerNames.concat(fixedLayerNames)
        : fixedLayerNames;

    if (visibleLayerNames && visibleLayerNames.length > 0) {
        myGraphic = toggle_graphicLayers(myGraphic, visibleLayerNames);
    }
}

exports.add_textiles = add_textiles;
exports.choose_object_layers = function (selection) {
    handleSelection(selection, choose_object_layers);
};
exports.flatten_textiles = function (selection) {
    handleSelection(selection, flatten_textiles);
};
exports.reactivate_jpg = function (selection) {
    handleSelection(selection, reactivate_jpg);
};
