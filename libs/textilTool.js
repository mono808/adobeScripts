var typeahead = require("typeahead");
var _id = require("_id");
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

    // get_graphicLayerNames(myImage, skipHiddenLayers, skipFixedLayers)
    var activeLayers = get_graphicLayerNames(texGraphic, true, false);
    var sourcePath = get_sourcePath(texGraphic);
    var jpgFilename = get_filename_from_path(sourcePath);
    jpgFilename += ".jpg";
    var jpgFile = new File("~/documents/adobeScripts/" + jpgFilename);

    texGraphic.exportFile(ExportFormat.JPG, jpgFile, false);
    replace_graphic(texRect, jpgFile);
    texRect.allGraphics[0].itemLink.unlink();
    //store path to source file in custom label, so the sourcefile can be relinked later
    texRect.insertLabel("sourcePath", sourcePath);
    //store active graphicLayers, so the displayed state of graphic can be rebuild after relinking
    texRect.insertLabel("activeLayers", activeLayers.join("_-_"));
    jpgFile.remove();
    return texRect;
}

function find_source_in_library(texRect) {
    var texGraphic = get_tex_graphic(texRect);
    var sourcePath = get_sourcePath(texGraphic);
    var sourceFilename = get_filename_from_path(sourcePath);
    var searchPattern = new RegExp(sourceFilename, "ig");
    var matches = ioFile.get_files(texRoot, searchPattern);
    matches.sort(function (a, b) {
        return a.displayName.toLowerCase() > b.displayName.toLowerCase();
    });

    if (!matches || matches.length === 0) return;

    var sourceFile;
    if (matches.length == 1) {
        sourceFile = matches[0];
    } else {
        var multiselect = false;
        sourceFile = typeahead.show_dialog(matches, "displayName", multiselect, "Vorlage wählen")[0];
    }

    return sourceFile.exists ? sourceFile : null;
}

function find_source_from_label(texRect) {
    var sourcePath = texRect.extractLabel("sourcePath");
    if (sourcePath == "") return null;
    var sourceFile = new File(sourcePath);
    return sourceFile.exists ? sourceFile : null;
}

function get_active_layers_from_label(texRect) {
    var activeLayersString = texRect.extractLabel("activeLayers");
    if (activeLayersString === "") return null;
    return activeLayersString.split("_-_");
}

function reactivate_jpg(texRect) {
    var sourceFile = find_source_from_label(texRect) || find_source_in_library(texRect);
    if (!sourceFile) {
        sourceFile = File(texRoot).openDlg("kuggst du selber wo ist datei");
    }
    if (!sourceFile) throw new Error("cant find a sourceFile to replace the jpg");
    replace_graphic(texRect, sourceFile);
    return texRect;
}

function reactivate_layers(texRect) {
    var activeLayers = get_active_layers_from_label(texRect);
    if (activeLayers && activeLayers.length > 0) {
        toggle_graphicLayers(texRect, activeLayers);
    }
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

function Textil(rect) {
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
    placedImage = this.rect.allGraphics[0];
    var msg = placedImage.properties.itemLink.name + " als JPG einbetten?";
    this.flatten = Window.confirm(msg, true);
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

exports.reactivate_layers = function (selection) {
    handleSelection(selection, reactivate_layers);
};
