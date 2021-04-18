var pcroot = Folder($.getenv("pcroot"));
var names = require("names");
var typeahead = require("typeahead");
var texTool = require("textilTool");

var MonoGraphic = require("MonoGraphic");
var IdBase = require("IdBase");
var MonoFilm = require("MonoFilm");

function MonoMockup(initDoc) {
    IdBase.call(this, initDoc);
    this.templates = [
        {
            type: "bags",
            file: File(
                pcroot.fullName +
                    "/adobeScripts/templates/Ansicht_Taschen_Master.indd"
            ),
            scale: 4.5
        },
        {
            type: "shirts",
            file: File(
                pcroot.fullName +
                    "/adobeScripts/templates/Ansicht_Shirt_Master.indd"
            ),
            scale: 6.5
        },
        {
            type: "accessoires",
            file: File(
                pcroot.fullName +
                    "/adobeScripts/templates/Ansicht_Accessoires_Master.indd"
            ),
            scale: 3
        }
    ];
    this.doc;
    this.type;
    this.scale;
    this.masterPages = {};
    this.layers = {};
    this.template;

    if (initDoc && initDoc.constructor.name == "Document") this.init(initDoc);
}

MonoMockup.prototype = Object.create(IdBase.prototype);
MonoMockup.prototype.constructor = MonoMockup;

MonoMockup.prototype.import_pages = function () {
    //var templateFile = this.get_scale() > 5 ? this.templates.shirts.file : this.templates.bags.file;
    this.templateDoc = app.open(this.template.file, false);

    this.label_pages(this.templateDoc);
    var pagesToImport = typeahead.show_dialog(
        this.templateDoc.pages,
        "label",
        true
    );

    //var selectedPages = this.select_textile_pages(this.templateDoc);
    this.copy_pages(this.templateDoc, this.doc, pagesToImport);
    this.templateDoc.close();

    return this;
};

MonoMockup.prototype.import_empty_template = function () {
    //var templateFile = this.get_scale() > 5 ? this.templates.shirts.file : this.templates.bags.file;
    this.templateDoc = app.open(this.template.file, false);

    var emptyTemplatePage = [this.templateDoc.pages.lastItem()];
    this.copy_pages(this.templateDoc, this.doc, emptyTemplatePage);
    this.templateDoc.close();

    return this;
};

MonoMockup.prototype.create_mockupDoc = function () {
    var retArray = typeahead.show_dialog(this.templates, "type", false);
    this.template = retArray[0] ? retArray[0] : null;

    if (!this.template) return null;
    this.templateDoc = app.open(this.template.file);

    //create doc preset based on the chosen template document
    var newDocPreset = this.createDocPresetFromMaster();

    // create new doc with this docPreset Object (will be the final mockup doc)
    this.doc = app.documents.add(true, newDocPreset, {});
    this.doc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;

    // copy styles, layers and masterpages from template file to mockup doc
    this.copyStyles(this.templateDoc, this.doc);
    this.copyLayers(this.templateDoc, this.doc);
    this.copyMasterPages(this.templateDoc, this.doc);

    return this;
};

MonoMockup.prototype.createDocPresetFromMaster = function () {
    //Creates a document preset based on the current document settings.

    if (app.documents.length > 0) {
        var myDoc = app.documents.item(0);
        var myDPreset = app.documentPresets.item("MockupMasterPreset");

        if (!myDPreset.isValid) {
            myDPreset = app.documentPresets.add({ name: "MockupMasterPreset" });
        }

        app.viewPreferences.horizontalMeasurementUnits =
            myDoc.viewPreferences.horizontalMeasurementUnits;
        app.viewPreferences.verticalMeasurementUnits =
            myDoc.viewPreferences.verticalMeasurementUnits;

        var myDPrefs = myDoc.documentPreferences;
        var myMPrefs = app.activeDocument.marginPreferences;

        myDPreset.left = myMPrefs.left;
        myDPreset.right = myMPrefs.right;
        myDPreset.top = myMPrefs.top;
        myDPreset.bottom = myMPrefs.bottom;
        myDPreset.columnCount = myMPrefs.columnCount;
        myDPreset.columnGutter = myMPrefs.columnGutter;
        myDPreset.documentBleedBottomOffset =
            myDPrefs.documentBleedBottomOffset;
        myDPreset.documentBleedTopOffset = myDPrefs.documentBleedTopOffset;
        myDPreset.documentBleedInsideOrLeftOffset =
            myDPrefs.documentBleedInsideOrLeftOffset;
        myDPreset.documentBleedOutsideOrRightOffset =
            myDPrefs.documentBleedOutsideOrRightOffset;
        myDPreset.facingPages = myDPrefs.facingPages;
        myDPreset.pageHeight = myDPrefs.pageHeight;
        myDPreset.pageWidth = myDPrefs.pageWidth;
        myDPreset.pageOrientation = myDPrefs.pageOrientation;
        myDPreset.pagesPerDocument = 1;
        myDPreset.slugBottomOffset = myDPrefs.slugBottomOffset;
        myDPreset.slugTopOffset = myDPrefs.slugTopOffset;
        myDPreset.slugInsideOrLeftOffset = myDPrefs.slugInsideOrLeftOffset;
        myDPreset.slugRightOrOutsideOffset = myDPrefs.slugRightOrOutsideOffset;
    }
    return myDPreset;
};

MonoMockup.prototype.check_create_layer = function (layerName) {
    var l = this.doc.layers.itemByName(layerName);
    if (!l.isValid) {
        l = this.doc.layers.add({ name: layerName });
    }
    return l;
};

MonoMockup.prototype.init = function () {
    if (!this.doc && app.documents.length > 0) this.doc = app.activeDocument;

    var vP = this.doc.viewPreferences;
    vP.horizontalMeasurementUnits = MeasurementUnits.millimeters;
    vP.verticalMeasurementUnits = MeasurementUnits.millimeters;
    vP.rulerOrigin = RulerOrigin.pageOrigin;

    this.scale = this.get_scale();
    this.type = this.scale > 5 ? "shirts" : "bags";

    var tD = this.doc.textDefaults;
    tD.appliedFont = app.fonts.item("Myriad Pro");
    tD.justification = Justification.LEFT_ALIGN;
    tD.pointSize = 11.5 * this.scale;
    tD.leading = 11.5 * this.scale;
    tD.hyphenation = false;

    this.masterPages.fixed = this.doc.masterSpreads.item("A-FixedStuff");
    this.masterPages.guides = this.doc.masterSpreads.item("B-Hilfslinien");
    this.masterPages.preview = this.doc.masterSpreads.item("C-Preview");

    // set layers
    this.layers.hl = this.check_create_layer("HL");
    this.layers.intern = this.check_create_layer("Intern");
    this.layers.shop = this.check_create_layer("Shop");
    this.layers.textils = this.check_create_layer("Textils");
    this.layers.prints = this.check_create_layer("Prints");
    this.layers.infos = this.check_create_layer("Infos");
    this.layers.fixed = this.check_create_layer("Fixed");

    this.doc.activeLayer = this.layers.prints;

    return this;
};

MonoMockup.prototype.get_scale = function () {
    var docwidth = this.doc.documentPreferences.pageWidth;
    return docwidth / 297;
};

MonoMockup.prototype.show_shop_logo = function (shop) {
    var myDoc = app.activeDocument,
        fixedMaster = myDoc.masterSpreads.item("A-FixedStuff");

    var logo;
    if (shop == "wme") {
        logo = fixedMaster.pageItems.item("wmeLogo");
        logo.visible = true;
        logo = fixedMaster.pageItems.item("csLogo");
        logo.visible = false;
    } else {
        logo = fixedMaster.pageItems.item("csLogo");
        logo.visible = true;
        logo = fixedMaster.pageItems.item("wmeLogo");
        logo.visible = false;
    }
};

MonoMockup.prototype.fill_job_infos = function (nfo) {
    var jobFrameBounds = this.masterPages.fixed.pageItems.item("mJobFrame")
        .geometricBounds;

    var tf = this.masterPages.fixed.textFrames.item("jobFrame");
    if (!tf.isValid) {
        tf = this.masterPages.fixed.textFrames.add({
            itemLayer: this.layers.infos,
            geometricBounds: jobFrameBounds,
            name: "jobFrame"
        });
    }

    var fixS = this.doc.paragraphStyles.item("fixedTextStyle");
    var variS = this.doc.paragraphStyles.item("variableTextStyle");
    var jobS = this.doc.paragraphStyles.item("jobTextStyle");
    var jobString;

    if (!nfo) {
        nfo = {
            client: "Max Musterman",
            jobNr: "0000A17-014",
            refNr: "---",
            design: "---"
        };
    }

    jobString = "Auftraggeber:\r";
    jobString += nfo.client;
    jobString += "\rAuftragsnummer:\r";
    jobString += nfo.jobNr;
    jobString += "\rAuftragsname:\r";
    jobString += nfo.jobName;
    jobString += "\rReferenz:\r";
    jobString += nfo.jobNr != nfo.refNr ? nfo.refNr : "---";

    tf.contents = jobString;
    var j,
        maxJ = tf.parentStory.paragraphs.length,
        pg;
    for (j = 0; j < maxJ; j += 1) {
        pg = tf.parentStory.paragraphs[j];
        if (j % 2 == 0) {
            pg.applyParagraphStyle(fixS, true);
        } else {
            pg.applyParagraphStyle(variS, true);
        }
    }

    // fill the intern jobNr textframe
    var intern_job_frame = this.masterPages.fixed.pageItems.item(
        "jobNr_kuerzel"
    );
    jobString = nfo.client;
    jobString += " - ";
    jobString += nfo.jobNr;
    if (nfo.jobNr != nfo.refNr) {
        jobString += "\nND ";
        jobString += nfo.refNr;
    }
    jobString += " - ";
    jobString += this.get_kuerzel();

    intern_job_frame.contents = jobString;
    intern_job_frame.paragraphs.item(0).applyParagraphStyle(jobS);
};

MonoMockup.prototype.get_kuerzel = function () {
    var username = $.getenv("USERNAME");

    if (username.indexOf(".") > 0) {
        // if username contains . make kuerzel from username jan.untiedt -> JU
        return (
            username.split(".")[0][0] + username.split(".")[1][0]
        ).toUpperCase();
    } else {
        return username;
    }
};

MonoMockup.prototype.label_pages = function (templateDoc) {
    var i, maxI, myPage, pageGraphics, textilName, j, maxJ;

    // go through all pages
    for (i = 0, maxI = templateDoc.pages.length; i < maxI; i += 1) {
        myPage = templateDoc.pages[i];

        //go through graphics on page
        if (myPage.allGraphics && myPage.allGraphics.length > 0) {
            pageGraphics = myPage.allGraphics;
            for (j = 0, maxJ = pageGraphics.length; j < maxJ; j += 1) {
                //if graphic is on textil-layer
                if (
                    pageGraphics[j].itemLayer ===
                    templateDoc.layers.item("Textils")
                ) {
                    textilName = pageGraphics[j].itemLink.name;
                    textilName = textilName.substring(
                        0,
                        textilName.lastIndexOf(".")
                    );
                    break;
                }
            }
        } else {
            textilName = "leere Vorlage";
        }

        myPage.label = textilName;
    }
};

MonoMockup.prototype.get_pageRefs = function (templateDoc, namesArray) {
    var i,
        maxI,
        pageName,
        j,
        maxJ,
        myPage,
        myTexPages = [];

    for (i = 0, maxI = namesArray.length; i < maxI; i += 1) {
        pageName = namesArray[i];
        for (j = 0, maxJ = templateDoc.pages.length; j < maxJ; j += 1) {
            myPage = templateDoc.pages[j];
            if (myPage.label == pageName) {
                myTexPages.push(myPage);
            }
        }
    }
    return myTexPages;
};

MonoMockup.prototype.select_textile_pages = function (templateDoc) {
    var win,
        myPage,
        i,
        maxI,
        pageNames = [];

    win = new Window("dialog", "Textilien wählen:");
    win.spacing = 3;

    for (i = 0, maxI = templateDoc.pages.length; i < maxI; i += 1) {
        myPage = templateDoc.pages[i];
        if (myPage.label != "StyleTester") {
            win[i] = win.add("checkbox", [10, 10, 150, 35], myPage.label);
            win[i].value = false;
        }
    }

    win.okButton = win.add("button", [10, 10, 150, 35], "Ok");
    win.okButton.onClick = function () {
        var box, k, maxK;

        for (k = 0, maxK = win.children.length; k < maxK; k += 1) {
            box = win.children[k];
            if (box.value === true) {
                pageNames.push(box.text);
            }
        }

        win.close();
    };

    win.show();

    pageNames.sort();

    return this.get_pageRefs(templateDoc, pageNames);
};

MonoMockup.prototype.copy_pages = function (sourceDoc, destDoc, pages2copy) {
    var dupedSpreads = [];

    for (var i = 0, maxI = pages2copy.length; i < maxI; i += 1) {
        var myPage = pages2copy[i];
        var dupedSpread = myPage.duplicate(
            LocationOptions.AFTER,
            destDoc.pages.lastItem()
        );
        //texTool.choose_object_layers(this.layers.textils.allGraphics);
        dupedSpreads.push(dupedSpread);
    }

    var defaultSpread = destDoc.masterSpreads.item("A-Musterseite");
    if (defaultSpread.isValid) defaultSpread.remove();

    if (destDoc.pages.item(0).pageItems.length == 0) {
        destDoc.pages.item(0).remove();
    }

    return dupedSpreads;
};

MonoMockup.prototype.place_prints_on_page = function (monoPrints) {
    var printLayer = this.layers.prints;
    var myPage = app.activeWindow.activePage;

    // loop through the array of prints to place on the activepage
    for (var j = 0; j < monoPrints.length; j++) {
        var mP = monoPrints[j];
        if (mP.film) {
            var monoFilm = new MonoFilm(mP.film);
            var sepPos = monoFilm.get_sepPos();
            monoFilm.filmDoc.close(SaveOptions.NO);
        }

        var side = names.name_side(mP.id);

        var xRef, hLine, x, y;
        if (side == "Back") {
            xRef = myPage.guides.item("midlineBack");
            hLine = myPage.graphicLines.item("necklineBack");
            x = xRef.location;
            y = (hLine.geometricBounds[0] + hLine.geometricBounds[2]) / 2;
        } else {
            xRef = myPage.guides.item("midlineFront");
            hLine = myPage.graphicLines.item("necklineFront");
            x = xRef.location;
            y = (hLine.geometricBounds[0] + hLine.geometricBounds[2]) / 2;
        }

        // if there is no preview file, use the druckfile for placing in the mockup instead
        var fileToPlace = mP.preview ? mP.preview : mP.print;
        var placedImages = myPage.place(fileToPlace, undefined, printLayer);
        var image = placedImages[0];

        // if there are films, position the graphic according to the sep position on the films
        var myPosition;
        if (sepPos) {
            myPosition = [x + sepPos.deltaX, y + sepPos.deltaY];
            image.parent.move(myPosition);
        } else {
            // center graphic on x guide
            var l = image.parent.geometricBounds[1];
            var r = image.parent.geometricBounds[3];
            myPosition = [x - (r - l) / 2, y + 80];
            image.parent.move(myPosition);
        }

        // if the bag is printed on both sides
        // duplicate the print and copy it to the backside of the bag
        // and position it exactly like on the frontside
        if (mP.id == "BeutelAA") {
            x = myPage.guides.item("midlineBack").location;
            hLine = myPage.graphicLines.item("necklineBack");
            y = (hLine.geometricBounds[0] + hLine.geometricBounds[2]) / 2;

            myPosition = [x + sepPos.deltaX, y + sepPos.deltaY];
            var rec = image.parent;
            rec.duplicate(myPosition);
        }
    }
};

MonoMockup.prototype.add_preview_page = function () {
    var page = this.doc.pages.add(LocationOptions.AT_END, {
        appliedMaster: this.masterPages.preview
    });

    var previewFrameStyle = this.doc.objectStyles.item("previewFrameStyle");
    var y1 = 0;
    var x1 = 0;
    var y2 = page.bounds[2];
    var x2 = page.bounds[3];
    var recBounds = [y1, x1, y2, x2];
    var rec = page.rectangles.add(undefined, undefined, undefined, {
        geometricBounds: recBounds,
        contentType: ContentType.GRAPHIC_TYPE,
        appliedObjectStyle: previewFrameStyle
    });
    this.split_frame(rec);
};

MonoMockup.prototype.get_monoGraphics = function (myPage, myLayer) {
    var myGraphics = [];

    for (var g = 0; g < myPage.allGraphics.length; g++) {
        var placedGraphic = myPage.allGraphics[g];
        if (placedGraphic.itemLayer === myLayer) {
            var myGraphic = new MonoGraphic(placedGraphic);
            myGraphics.push(myGraphic);
        }
    }

    myGraphics.sort(function (a, b) {
        return (
            names.name("posOrder", a.get_side()) >
            names.name("posOrder", b.get_side())
        );
    });

    return myGraphics;
};

MonoMockup.prototype.get_all_monoGraphics = function () {
    var printsLayer = this.layers.prints;
    var previewMaster = this.doc.masterSpreads.item("C-Preview");
    var monoGraphics = [];
    for (var i = 0; i < this.doc.allGraphics.length; i++) {
        var graphic = this.doc.allGraphics[i];
        if (graphic.parent.itemLayer != printsLayer) continue;
        if (
            !graphic.parentPage ||
            graphic.parentPage.appliedMaster == previewMaster
        )
            continue;
        monoGraphics.push(new MonoGraphic(graphic));
    }
    return monoGraphics;
};

MonoMockup.prototype.show_wawiString_dialog = function (rowObjs, job) {
    var dialogName = "WaWi Infos nachtragen zu ->  ";
    dialogName += job
        ? job.nfo.jobNr + " - " + job.nfo.client
        : "irgendeinem bekloppten Auftrag";

    var win = new Window("palette", dialogName); // bounds = [left, top, right, bottom]
    this.windowRef = win;

    var wawiPanel = win.add("panel", undefined, "");
    for (var i = 0; i < rowObjs.length; i++) {
        var row = wawiPanel.add("group");
        row.add("statictext", undefined, rowObjs[i].tex);
        row.add("edittext", undefined, rowObjs[i].wawi);
    }

    var btnPanel = win.add("panel", undefined, "");
    btnPanel.orientation = "row";

    var closeBtn = btnPanel.add("button", [15, 65, 105, 85], "yep");

    closeBtn.onClick = function () {
        win.close();
    };

    win.show();
};

MonoMockup.prototype.show_hinweisDialog = function () {
    var collect_hinweise = function () {
        var hinweise = [];
        for (var j = 0, len = editTexts.length; j < len; j++) {
            $.writeln(editTexts[j].text);
            hinweise.push(editTexts[j].text);
        }
        return hinweise.join("\r");
    };

    var returnValue = {};

    var win = new Window("dialog", "Hinweise erstellen");
    this.windowRef = win;

    var textPanel = win.add("panel", undefined, "");
    var row,
        editText,
        editTexts = [];
    for (var i = 0; i < 3; i++) {
        row = textPanel.add("group");
        row.add("statictext", undefined, "Zeile " + i);
        editText = row.add("edittext", undefined, "");
        editText.preferredSize.width = 400;
        editTexts.push(editText);
    }

    var btnPanel = win.add("panel", undefined, "");
    btnPanel.orientation = "row";

    btnPanel.internBtn = btnPanel.add("button", undefined, "Intern");
    btnPanel.kundeBtn = btnPanel.add("button", undefined, "Kunde");
    btnPanel.cancelBtn = btnPanel.add("button", undefined, "Cancel");

    btnPanel.internBtn.onClick = function () {
        returnValue.layername = "Intern";
        returnValue.hinweis = collect_hinweise();
        win.close();
    };
    btnPanel.kundeBtn.onClick = function () {
        returnValue.layername = "Infos";
        returnValue.hinweis = collect_hinweise();
        win.close();
    };

    btnPanel.cancelBtn.onClick = function () {
        $.writeln("dialog cancelled");
        returnValue = null;
        win.close();
    };

    if (win.show() == 2) {
        $.writeln("dialog cancelled");
        returnValue = null;
        win.close();
    }

    return returnValue;
};

MonoMockup.prototype.add_hinweis = function () {
    var myPage = app.activeWindow.activePage;
    var doc = myPage.parent.parent;

    var dialogResult = this.show_hinweisDialog();

    if (!dialogResult) return;

    var lastLayer = doc.activeLayer;
    var myLayer = doc.layers.item(dialogResult.layername);
    doc.activeLayer = myLayer;

    var objStyle = doc.objectStyles.item("hinweisFrameStyle");
    if (!objStyle.isValid) {
        objStyle = doc.objectStyles.item(0);
    }

    var tFBounds = [800, 32.5, 1000, 600];
    var myTF = myPage.textFrames.add({
        geometricBounds: tFBounds,
        itemLayer: myLayer,
        name: "hinweisFrame",
        appliedObjectStyle: objStyle
    });

    myTF.contents = dialogResult.hinweis;

    var paragraphStyle = doc.paragraphStyles.item("hinweisTextStyle");
    if (!paragraphStyle.isValid) {
        paragraphStyle = doc.paragraphStyles.add();
    }

    paragraphStyle.appliedFont = "Myriad Pro";
    paragraphStyle.fontStyle = "Regular";
    paragraphStyle.pointSize = 15 * this.scale;
    paragraphStyle.fillColor = "C=0 M=100 Y=0 K=0";
    paragraphStyle.justification = Justification.LEFT_ALIGN;

    myTF.paragraphs.everyItem().applyParagraphStyle(paragraphStyle);

    doc.activeLayer = lastLayer;
    return myTF;
};

MonoMockup.prototype.add_stand_listener = function (turnOn) {
    var doc = app.activeDocument;

    var includesFolder = $.getenv("JSINCLUDE");
    doc.removeEventListener(
        "afterSelectionAttributeChanged",
        new File(includesFolder + "/myStandListener.jsx")
    );
    if (turnOn)
        doc.addEventListener(
            "afterSelectionAttributeChanged",
            new File(includesFolder + "/myStandListener.jsx")
        );
};

MonoMockup.prototype.remove_stand_listener = function () {
    var doc = app.activeDocument;

    var includesFolder = $.getenv("JSINCLUDE");
    doc.removeEventListener(
        "afterSelectionAttributeChanged",
        new File(includesFolder + "/myStandListener.jsx")
    );
};

MonoMockup.prototype.copyStyles = function (source, dest) {
    dest.importStyles(ImportFormat.PARAGRAPH_STYLES_FORMAT, source.fullName);
    dest.importStyles(ImportFormat.CELL_STYLES_FORMAT, source.fullName);
    dest.importStyles(ImportFormat.TABLE_STYLES_FORMAT, source.fullName);
    dest.importStyles(ImportFormat.OBJECT_STYLES_FORMAT, source.fullName);
};

MonoMockup.prototype.copyLayers = function (source, dest) {
    for (var i = 0, maxI = source.layers.length; i < maxI; i += 1) {
        var sourceLayer = source.layers[i];
        var destLayer = dest.layers.item(sourceLayer.name);
        if (!destLayer.isValid) {
            destLayer = dest.layers.add({ name: sourceLayer.name });
            destLayer.move(LocationOptions.AT_END);
        }
    }
    try {
        dest.layers.item("Ebene 1").remove();
    } catch (e) {
        $.writeln(e.toSource());
    }
};

MonoMockup.prototype.copyMasterPages = function (sourceDoc, destDoc) {
    for (var i = 0, maxI = sourceDoc.masterSpreads.length; i < maxI; i += 1) {
        var mS = sourceDoc.masterSpreads[i];
        mS.duplicate(LocationOptions.AT_END, destDoc);
    }

    try {
        var defaultSpread = destDoc.masterSpreads.item("A-Musterseite");
        defaultSpread.remove();
    } catch (e) {
        $.writeln(e);
    }
};

MonoMockup.prototype.split_frame = function (myFrame) {
    app.scriptPreferences.userInteractionLevel =
        UserInteractionLevels.interactWithAll;

    var myObjectList = new Array();
    if (myFrame) {
        myDisplayDialog([myFrame]);
    } else if (app.documents.length != 0) {
        if (app.selection.length != 0) {
            for (
                var myCounter = 0;
                myCounter < app.selection.length;
                myCounter++
            ) {
                switch (app.selection[myCounter].constructor.name) {
                    case "GraphicLine":
                    case "Oval":
                    case "Polygon":
                    case "Rectangle":
                    case "TextFrame":
                        myObjectList.push(app.selection[myCounter]);
                        break;
                }
            }
            if (myObjectList.length != 0) {
                myDisplayDialog(myObjectList);
            }
        }
    }
    function myDisplayDialog(myObjectList) {
        var win = new Window("dialog", "Vorschaurahmen erstellen");
        this.windowRef = win;
        win.orientation = "row";

        var editPanel = win.add("panel", undefined, "");
        editPanel.alignment = "fill";
        editPanel.alignChildren = "right";

        var columnGroup = editPanel.add("group");
        columnGroup.alignChildren = "right";
        columnGroup.add("statictext", undefined, "Spalten:");
        var columnCount = columnGroup.add("edittext", undefined, "1");
        columnCount.preferredSize.width = 35;

        var rowGroup = editPanel.add("group");
        rowGroup.add("statictext", undefined, "Zeilen:");
        var rowCount = rowGroup.add("edittext", undefined, "1");
        rowCount.preferredSize.width = 35;

        var btnPanel = win.add("panel", undefined, "");
        btnPanel.orientation = "column";

        btnPanel.okBtn = btnPanel.add("button", undefined, "OK");
        btnPanel.cancelBtn = btnPanel.add("button", undefined, "Cancel");

        btnPanel.okBtn.onClick = function () {
            win.close(true);
        };

        if (win.show()) {
            var myNumberOfRows = rowCount.text;
            var myNumberOfColumns = columnCount.text;
            mySplitFrames(
                myObjectList,
                myNumberOfRows,
                myNumberOfColumns,
                0,
                0,
                ContentType.graphicType,
                true,
                true
            );
        }
    }
    function mySplitFrames(
        myObjectList,
        myNumberOfRows,
        myNumberOfColumns,
        myRowGutter,
        myColumnGutter,
        myFrameType,
        myRetainFormatting,
        myDeleteObject
    ) {
        var myOldXUnits =
            app.activeDocument.viewPreferences.horizontalMeasurementUnits;
        var myOldYUnits =
            app.activeDocument.viewPreferences.verticalMeasurementUnits;
        app.activeDocument.viewPreferences.horizontalMeasurementUnits =
            MeasurementUnits.millimeters;
        app.activeDocument.viewPreferences.verticalMeasurementUnits =
            MeasurementUnits.millimeters;
        for (var myCounter = 0; myCounter < myObjectList.length; myCounter++) {
            mySplitFrame(
                myObjectList[myCounter],
                myNumberOfRows,
                myNumberOfColumns,
                myRowGutter,
                myColumnGutter,
                myFrameType,
                myRetainFormatting,
                myDeleteObject
            );
        }
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = myOldXUnits;
        app.activeDocument.viewPreferences.verticalMeasurementUnits = myOldYUnits;
    }
    function mySplitFrame(
        myObject,
        myNumberOfRows,
        myNumberOfColumns,
        myRowGutter,
        myColumnGutter,
        myFrameType,
        myRetainFormatting,
        myDeleteObject
    ) {
        var myX1, myY1, myX2, myY2, myNewObject;
        var myBounds = myObject.geometricBounds;
        var myWidth = myBounds[3] - myBounds[1];
        var myHeight = myBounds[2] - myBounds[0];
        //Don't bother making the frames if the width/height of the frame is too small
        //to accomodate the row/column gutter values.
        if (
            myRowGutter * (myNumberOfRows - 1) < myHeight &&
            myColumnGutter * (myNumberOfColumns - 1) < myWidth
        ) {
            var myColumnWidth =
                (myWidth - myColumnGutter * (myNumberOfColumns - 1)) /
                myNumberOfColumns;
            var myRowHeight =
                (myHeight - myRowGutter * (myNumberOfRows - 1)) /
                myNumberOfRows;
            for (
                var myRowCounter = 0;
                myRowCounter < myNumberOfRows;
                myRowCounter++
            ) {
                myY1 =
                    myBounds[0] +
                    myRowHeight * myRowCounter +
                    myRowGutter * myRowCounter;
                myY2 = myY1 + myRowHeight;
                for (
                    var myColumnCounter = 0;
                    myColumnCounter < myNumberOfColumns;
                    myColumnCounter++
                ) {
                    myX1 =
                        myBounds[1] +
                        myColumnWidth * myColumnCounter +
                        myColumnGutter * myColumnCounter;
                    myX2 = myX1 + myColumnWidth;
                    if (myRetainFormatting == true) {
                        myNewObject = myObject.duplicate();
                        myNewObject.geometricBounds = [myY1, myX1, myY2, myX2];
                    } else {
                        myNewObject = myObject.parent.rectangles.add(
                            undefined,
                            undefined,
                            undefined,
                            {
                                geometricBounds: [myY1, myX1, myY2, myX2],
                                contentType: myFrameType
                            }
                        );
                    }
                    if (myRetainFormatting == false) {
                        myNewObject.contentType = myFrameType;
                    }
                }
            }
            if (myDeleteObject == true) {
                myObject.remove();
            }
        }
    }
};

exports = module.exports = MonoMockup;
