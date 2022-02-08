var typeahead = require("typeahead");
var _id = require("f_id");
var ioFile = require("ioFile");

var csroot = Folder(CSROOT).fullName;
var ignoreBridge = /^(?!.*(\.bridge)).*$/i;
var fixedLayerNames = ["Shirt", "Naht", "Tasche", "Beutel", "Hintergrund"];
var listAlways = "front|back|left|right|side";
var texRoot = new Folder("/c/textilien");
if (!texRoot.exists) {
    texRoot = new Folder(csroot + "/Produktion/Druckvorstufe/textilien");
}

function place_image(args) {
    var placedItemsArray = args.placeTo.place(args.image, undefined, args.layer);
    if (placedItemsArray) {
        return placedItemsArray[0];
    }
}

function select_textile(args) {
    var texFiles = ioFile.get_files(texRoot, ignoreBridge);
    texFiles.sort(function (a, b) {
        return a.displayName.toLowerCase() > b.displayName.toLowerCase();
    });
    var texResult = typeahead.show_dialog(texFiles, "displayName", args.multiselect, "Textilien wählen");
    if (!texResult || texResult.length === 0) {
        alert("Script cancelled, no textiles selected!");
        return null;
    }
    return texResult[0];
}

function place_textile_graphic(myRect) {
    var doc = app.activeDocument;
    var texLayer = doc.layers.item("Textils");
    texLayer = texLayer.isValid ? texLayer : doc.activeLayer;

    var textile = select_textile({
        multiselect: false
    });

    if (!textile) return;

    var placedImage;
    if (!myRect) {
        placedImage = place_image({
            placeTo: doc.layoutWindows[0].activePage,
            image: textile,
            layer: texLayer
        });
        myRect = placedImage.parent;
        app.selection = [myRect];
    } else {
        var frameFitOpts = myRect.frameFittingOptions;
        frameFitOpts.fittingAlignment = AnchorPoint.TOP_CENTER_ANCHOR;
        frameFitOpts.fittingOnEmptyFrame = EmptyFrameFittingOptions.NONE;
        frameFitOpts.autoFit = false;

        placedImage = place_image({
            placeTo: myRect,
            image: textile,
            layer: texLayer
        });

        myRect.fit(FitOptions.APPLY_FRAME_FITTING_OPTIONS);
        myRect.fit(FitOptions.CENTER_CONTENT);
        myRect.fit(FitOptions.FRAME_TO_CONTENT);
    }

    return myRect;
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

function flatten_textile(texRect) {
    var texGraphic = get_tex_graphic(texRect);
    if (texGraphic.imageTypeName === "JPEG") {
        alert("Image is already a JPG, no need to flatten again");
        return;
    }

    var sourcePath = get_sourcePath(texGraphic);
    var jpgFilename = get_filename_from_path(sourcePath);
    jpgFilename += ".jpg";
    var jpgFile = new File("~/documents/adobeScripts/" + jpgFilename);

    texGraphic.exportFile(ExportFormat.JPG, jpgFile, false);
    replace_graphic(texRect, jpgFile);
    texRect.allGraphics[0].itemLink.unlink();
    jpgFile.remove();
    return texRect;
}

function reactivate_jpg(texRect) {
    var texGraphic = get_tex_graphic(texRect);
    var sourcePath = get_sourcePath(texGraphic);
    var sourceFilename = get_filename_from_path(sourcePath);
    var searchPattern = new RegExp(sourceFilename, "ig");
    var foundTex = ioFile.get_files(texRoot, searchPattern);
    foundTex.sort(function (a, b) {
        return a.displayName.toLowerCase() > b.displayName.toLowerCase();
    });

    if (!foundTex || foundTex.length === 0) return;

    var selectedTex;
    if (foundTex.length == 1) {
        selectedTex = foundTex[0];
    } else {
        var multiselect = false;
        selectedTex = typeahead.show_dialog(foundTex, "displayName", multiselect, "Textilien wählen");
    }
    replace_graphic(texRect, selectedTex);
    return texRect;
}

function get_tex_graphic(texRect) {
    var texGraphic = null;
    if (texRect.constructor.name === "Rectangle" && texRect.graphics.length > 0) {
        texGraphic = texRect.graphics[0];
    }
    return texGraphic;
}

function choose_object_layers(texRect) {
    var imageTypes = ["Adobe PDF", "Photoshop"];
    var texGraphic = get_tex_graphic(texRect);
    //$.writeln("choosing object layers on " + texGraphic.constructor.name);

    if (texGraphic.imageTypeName === "JPEG") {
        //$.writeln("switching embedded jpg with layered linked graphic");
        reactivate_jpg(texRect, texGraphic);
        texGraphic = texRect.graphics[0];
    }

    if (!imageTypes.includes(texGraphic.imageTypeName)) {
        $.writeln("cant choose object layers on " + texGraphic.constructor.name);
        return null;
    }

    var graphicLayerNames = get_graphicLayerNames(texGraphic, false, true);

    //inputElements, propertyToList, multiselect, dialogTitle, listAlways
    var selectedLayerNames = typeahead.show_dialog(graphicLayerNames, undefined, true, undefined, listAlways);

    var visibleLayerNames = selectedLayerNames ? selectedLayerNames.concat(fixedLayerNames) : fixedLayerNames;

    return visibleLayerNames;
}

function toggle_graphicLayers(texRect, visibleLayerNames) {
    var texGraphic = get_tex_graphic(texRect);
    var gLO = texGraphic.graphicLayerOptions;
    var gL;
    texRect.visible = false;

    for (var k = 0, lenK = gLO.graphicLayers.length; k < lenK; k++) {
        gL = gLO.graphicLayers[k];
        if (!gL.isValid) continue;

        if (visibleLayerNames.includes(gL.name)) {
            if (gL.currentVisibility) continue;
            gL.currentVisibility = true;
            if (!gLO.isValid) gLO = texRect.graphics.item(0).graphicLayerOptions;
        } else {
            if (!gL.currentVisibility) continue;
            gL.currentVisibility = false;
            if (!gLO.isValid) gLO = texRect.graphics.item(0).graphicLayerOptions;
        }
    }
    texRect.visible = true;
    return texRect;
}

function add_tex_rect() {
    var rectBounds = [0, 0, 400, 300];
    var rect = app.activeWindow.activePage.rectangles.add({
        geometricBounds: rectBounds,
        contentType: ContentType.GRAPHIC_TYPE,
        strokeColor: "None",
        fillColor: "None"
    });
    var delta = _id.get_center_delta_from_bounds(app.activeWindow.activePage.bounds, rect.geometricBounds);
    rect.move(undefined, [delta.x, delta.y]);
    return rect;
}

function Textil(rect) {
    var msg = "Textil als JPG einbetten?";

    this.rect = rect || add_tex_rect();

    var placedImage;
    if (this.rect.allGraphics.length === 0) {
        placedImage = place_textile_graphic(this.rect);
    } else {
        placedImage = this.rect.allGraphics[0];
    }
    if (!placedImage) return null;

    this.textil = this.rect.allGraphics[0];
    this.layers = choose_object_layers(this.rect);
    this.flatten = Window.confirm(msg, true, "Textil als JPG einbetten?");
}

function apply_settings(textil) {
    if (textil.layers && textil.layers.length > 0) {
        toggle_graphicLayers(textil.rect, textil.layers);
    }
    if (textil.flatten) {
        flatten_textile(textil.rect);
    }
}

function handleSelection(textilArray, func) {
    if (!textilArray || textilArray.length == 0) {
        return;
    }

    //var finalSelection = [];
    var textil;
    for (var i = 0, lenI = textilArray.length; i < lenI; i++) {
        textil = textilArray[i];
        func(textil);
        //finalSelection.push(textil);
    }
    //app.selection = finalSelection;
}

function init_textils(selection) {
    var textils = [];
    if (selection.length == 0) {
        var textil = new Textil();
        if (textil) textils.push(textil);
    } else {
        selection.forEach(function (selectionItem) {
            var textil = new Textil(selectionItem);
            if (textil) textils.push(textil);
        });
    }
    return textils;
}

exports.add_textile_old = function (selection) {
    if (selection && selection.length > 0) {
        handleSelection(selection, place_textile_graphic);
    } else {
        place_textile_graphic();
    }
};

exports.add_textile = function (selection) {
    var textils = init_textils(selection);
    textils.forEach(function (textil) {
        apply_settings(textil);
    });
};

exports.choose_object_layers = function (selection) {
    //handleSelection(selection, choose_object_layers);
    var textils = init_textils(selection);
    textils.forEach(function (textil) {
        apply_settings(textil);
    });
};
exports.flatten_textile = function (selection) {
    handleSelection(selection, flatten_textile);
};
exports.reactivate_jpg = function (selection) {
    handleSelection(selection, reactivate_jpg);
};
