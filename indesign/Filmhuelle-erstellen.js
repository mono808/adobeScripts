//@target indesign
//@include "require.js"

var names = require("names");
var MonoFilm = require("MonoFilm");
var MonoPrint = require("MonoPrint");
var MonoSep = require("MonoSep");

function createTextFrame(doc) {
    var myPage = doc.pages.item(0);
    var myTextFrame = myPage.textFrames.add();

    myTextFrame.geometricBounds = myGetBounds(doc, myPage);
    myTextFrame.contents = "This is some example text.";
    return myTextFrame;
}

function myGetBounds(myDoc, myPage) {
    var myPageWidth = myDoc.documentPreferences.pageWidth;
    var myPageHeight = myDoc.documentPreferences.pageHeight;

    var myX1, myX2;
    if (myPage.side == PageSideOptions.leftHand) {
        myX2 = myPage.marginPreferences.left;
        myX1 = myPage.marginPreferences.right;
    } else {
        myX1 = myPage.marginPreferences.left;
        myX2 = myPage.marginPreferences.right;
    }
    myX2 = myPageWidth - myX2;

    var myY1 = myPage.marginPreferences.top;
    var myY2 = myPageHeight - myPage.marginPreferences.bottom;

    return [myY1, myX1, myY2, myX2];
}

function checkCreateStyle(type, name) {
    var myDoc = app.activeDocument;
    var existingStyles;
    var newStyle = null;

    switch (type) {
        case "cell":
            existingStyles = myDoc.cellStyles;
            break;
        case "paragraph":
            existingStyles = myDoc.paragraphStyles;
            break;
        case "table":
            existingStyles = myDoc.tableStyles;
            break;
        case "character":
            existingStyles = myDoc.characterStyles;
            break;
        case "object":
            existingStyles = myDoc.objectStyles;
            break;
        case "textDefaults":
            newStyle = myDoc.textDefaults;
            break;
    }

    if (!newStyle) {
        newStyle = existingStyles.item(name);
        if (newStyle.isValid) {
            return newStyle;
        } else {
            return existingStyles.add({ name: name });
        }
    }
}

function createStyles(doc) {
    var defaultPStyle = checkCreateStyle("paragraph", "defaultPStyle");
    defaultPStyle.fillColor = doc.colors.item("Black");
    defaultPStyle.pointSize = 11;
    defaultPStyle.leading = "11 points";
    defaultPStyle.spaceBefore = 0;
    defaultPStyle.justification = Justification.LEFT_ALIGN;
    try {
        defaultPStyle.appliedFont = app.fonts.item("Myriad Pro");
    } catch (e) {}
    try {
        defaultPStyle.fontStyle = "Regular";
    } catch (e) {}

    var jobPStyle = checkCreateStyle("paragraph", "jobPStyle");
    jobPStyle.basedOn = defaultPStyle;
    jobPStyle.pointSize = 16;
    jobPStyle.leading = "16 points";
    jobPStyle.justification = Justification.CENTER_ALIGN;
    jobPStyle.fontStyle = "Bold";

    var posPStyle = checkCreateStyle("paragraph", "posPStyle");
    posPStyle.basedOn = jobPStyle;
    posPStyle.pointSize = 14;
    posPStyle.leading = "14 points";

    var colorPStyle = checkCreateStyle("paragraph", "colorsPStyle");
    colorPStyle.basedOn = defaultPStyle;
    colorPStyle.justification = Justification.RIGHT_ALIGN;
    colorPStyle.hyphenation = false;

    var defaultCStyle;
    defaultCStyle = checkCreateStyle("cell", "defaultCStyle");
    defaultCStyle.leftInset = 2;
    defaultCStyle.rightInset = 2;
    defaultCStyle.bottomInset = 2;
    defaultCStyle.topInset = 2;

    defaultCStyle.topEdgeStrokeTint = 20;
    defaultCStyle.leftEdgeStrokeTint = 20;
    defaultCStyle.bottomEdgeStrokeTint = 20;
    defaultCStyle.rightEdgeStrokeTint = 20;

    defaultCStyle.topEdgeStrokeWeight = 2;
    defaultCStyle.leftEdgeStrokeWeight = 2;
    defaultCStyle.bottomEdgeStrokeWeight = 2;
    defaultCStyle.rightEdgeStrokeWeight = 2;

    defaultCStyle.topEdgeStrokeColor = doc.swatches.item("Black");
    defaultCStyle.leftEdgeStrokeColor = doc.swatches.item("Black");
    defaultCStyle.bottomEdgeStrokeColor = doc.swatches.item("Black");
    defaultCStyle.rightEdgeStrokeColor = doc.swatches.item("Black");

    var colorsCStyle = checkCreateStyle("cell", "colorsCStyle");
    colorsCStyle.basedOn = defaultCStyle;
    colorsCStyle.appliedParagraphStyle = doc.paragraphStyles.item("colorsPStyle");

    var posCStyle = checkCreateStyle("cell", "posCStyle");
    posCStyle.basedOn = defaultCStyle;
    posCStyle.appliedParagraphStyle = doc.paragraphStyles.item("posPStyle");

    var jobCStyle = checkCreateStyle("cell", "jobCStyle");
    jobCStyle.basedOn = defaultCStyle;
    jobCStyle.appliedParagraphStyle = doc.paragraphStyles.item("jobPStyle");

    var defaultTStyle = checkCreateStyle("table", "defaultTStyle");
    defaultTStyle.bodyRegionCellStyle = "defaultCStyle";
    defaultTStyle.headerRegionCellStyle = "jobCStyle";
}

function createTable(doc) {
    var tableTempString = "Client1\tClient 2\tJobNr\tjobName\rPos1\tPos2\tPos3\tPos4\rColors1\tColors2\tColors3\tColors4\rimage1\timage2\timage3\timage4";

    var myTF = createTextFrame(doc);
    myTF.contents = tableTempString;
    myTF.fillColor = doc.swatches.item("Paper");
    myTF.texts.item(0).convertToTable();

    var myTable = myTF.tables.item(0);
    myTable.appliedTableStyle = "defaultTStyle";
    myTable.cells.everyItem().contents = "";

    var jobRow = myTable.rows.item(0);
    jobRow.minimumHeight = 15;
    jobRow.verticalJustification = VerticalJustification.CENTER_ALIGN;

    var posRow = myTable.rows.item(1);
    posRow.minimumHeight = 9;
    posRow.verticalJustification = VerticalJustification.CENTER_ALIGN;

    var colorRow = myTable.rows.item(2);
    colorRow.minimumHeight = 10;

    return myTable;
}

function createFrame(cell) {
    var doc = app.activeDocument;
    var rectOpts = {
        fillColor: doc.swatches.item("None"),
        fillTint: 100,
        frameFittingOptions: {
            autoFit: true,
            fittingOnEmptyFrame: EmptyFrameFittingOptions.PROPORTIONALLY,
            bottomCrop: -15,
            leftCrop: -15,
            topCrop: -15,
            rightCrop: -15
        }
    };

    var rect = cell.insertionPoints[0].rectangles.add(rectOpts);
    rect.contentType = ContentType.GRAPHIC_TYPE;

    var gbs = rect.geometricBounds;
    gbs[0] = gbs[2] - cell.height + cell.topInset;
    gbs[2] = gbs[2] - cell.bottomInset;
    gbs[3] = gbs[1] + cell.width - cell.rightInset;
    gbs[1] = gbs[1] + cell.leftInset;
    rect.geometricBounds = gbs;
    rect.anchoredObjectSettings.anchoredPosition = AnchorPosition.inlinePosition;
    rect.anchoredObjectSettings.anchorYoffset = cell.topInset - cell.height;

    return rect;
}

function prepCell(cell) {
    cell.contents = "";
    cell.insertionPoints[0].contents = "\r";
    cell.properties = {
        clipContentToCell: true,
        autoGrow: false,
        firstBaselineOffset: FirstBaseline.fixedHeight,
        minimumFirstBaselineOffset: 0,
        topInset: 1,
        leftInset: 1,
        bottomInset: 1,
        rightInset: 1
    };
    cell.paragraphs[0].properties = {
        leading: 0,
        justification: Justification.centerAlign,
        leftIndent: 1,
        rightIndent: 1,
        firstLineIndent: 1,
        lastLineIndent: 1
    };
}

function import_graphic_to_cell(graphic, cell) {
    if (graphic && cell) {
        prepCell(cell);
        var targFrame = createFrame(cell);
        targFrame.place(graphic);
    }
}

function fill_table_with_printNfo(monoPrints, myTable, names) {
    var jobRow = myTable.rows.item(0);
    jobRow.cells.everyItem().appliedCellStyle = "jobCStyle";

    var posRow = myTable.rows.item(1);
    posRow.cells.everyItem().appliedCellStyle = "posCStyle";

    var colorsRow = myTable.rows.item(2);
    colorsRow.cells.everyItem().appliedCellStyle = "colorsCStyle";

    for (var i = 0; i < monoPrints.length; i++) {
        var monoFilm = new MonoFilm(monoPrints[i].film);
        var use_longNames = true;
        var spotNames = monoFilm.get_spotNames(use_longNames);
        monoFilm.close(SaveOptions.YES);

        var posCell = posRow.cells.item(i);
        posCell.contents = names.name("printId", monoPrints[i].id);

        var colorCell = colorsRow.cells.item(i);
        colorCell.contents = spotNames.join(", ");
    }

    var tFHeight = myTable.parent.geometricBounds[2] - myTable.parent.geometricBounds[0] - 1;
    var rowsHeight = jobRow.height + posRow.height + colorsRow.height;

    var imageRow = myTable.rows.item(3);
    imageRow.height = tFHeight - rowsHeight;

    for (var j = 0; j < monoPrints.length; j++) {
        var imageCell = myTable.rows.item(3).cells.item(j);
        var myImage = monoPrints[j].preview;
        import_graphic_to_cell(myImage, imageCell);
    }
}

function fill_table_with_jobNfo(table2Fill, jobNfo) {
    var jobRow = table2Fill.rows.item(0);

    var clCell = jobRow.cells.item(0).merge(jobRow.cells.item(1));
    clCell.contents = jobNfo.client;
    clCell.appliedCellStyle = "jobCStyle";

    var jobNrCell = jobRow.cells.item(1);
    jobNrCell.contents = jobNfo.jobNr;
    jobNrCell.appliedCellStyle = "jobCStyle";

    var jobNameCell = jobRow.cells.item(2);
    jobNameCell.contents = jobNfo.jobName;
    jobNameCell.appliedCellStyle = "jobCStyle";
}

function create_aufkleber() {
    var docWidth = 207;
    var docHeight = 146;

    var myDocPreset = app.documentPresets.item("filmhuellePreset");
    if (!myDocPreset.isValid) {
        myDocPreset = app.documentPresets.add({ name: "filmhuellePreset" });
    }

    myDocPreset.facingPages = false;
    myDocPreset.pageHeight = docHeight;
    myDocPreset.pageWidth = docWidth;
    myDocPreset.top = 20;
    myDocPreset.left = 3;
    myDocPreset.bottom = 20;
    myDocPreset.right = 3;

    var myDoc = app.documents.add(true, myDocPreset, {});
    var myDocument = app.activeDocument;
    myDoc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;

    var vP = myDocument.viewPreferences;
    vP.horizontalMeasurementUnits = MeasurementUnits.millimeters;
    vP.verticalMeasurementUnits = MeasurementUnits.millimeters;
    vP.rulerOrigin = RulerOrigin.pageOrigin;

    createStyles(myDoc);

    createTable(myDoc);

    myDoc.textDefaults.hyphenation = false;

    return myDoc;
}

function main() {
    //@include "require.js"

    var job = require("job");
    var paths = require("paths");
    var _ = require("_");
    var jobFolder = require("jobFolder");
    var names = require("names");
    var BaseDoc = require("BaseDoc");

    //job.set_nfo(null, false, false);
    var jobNfo = job.get_jobNfo();
    paths.set_nfo(jobNfo);
    jobFolder.set_folder(jobNfo.folder);

    var doc = create_aufkleber();

    var myPage = doc.pages.item(0);
    var myTable = myPage.textFrames.item(0).tables.item(0);

    fill_table_with_jobNfo(myTable, jobNfo);

    var monoPrints = jobFolder.get_prints();

    if (monoPrints.length < 1) {
        alert("Keine Siebdruck-Dateien gefunden, Filmhuelle wird nicht erstellt");
        doc.close(SaveOptions.NO);
        return;
    }

    var sdPrints = [];
    for (var i = 0; i < monoPrints.length; i++) {
        if (monoPrints[i].film) {
            sdPrints.push(monoPrints[i]);
        }
    }

    sdPrints.sort(function (a, b) {
        var sideA = names.name("side", a.id);
        var sideB = names.name("side", b.id);
        return sideA < sideB;
    });

    var pageCount = Math.ceil(sdPrints.length / 4); //calculate number of pages needed (4 graphics per page)

    // create duplicates of myPage if needed (already filled with jobnfo only, empty elsewhere)
    for (var i = 1; i < pageCount; i++) {
        myPage.duplicate(LocationOptions.AT_END);
    }

    // use the array of empty pages to fill with 4 prints each
    for (i = 0; i < doc.pages.length; i++) {
        var fourtett = sdPrints.splice(0, 4);
        var myPage = doc.pages[i];
        var myTable = myPage.textFrames.item(0).tables.item(0);
        fill_table_with_printNfo(fourtett, myTable, names);
    }

    if (app.activeDocument.saved == false) {
        BaseDoc.prototype.save_doc(paths.file("filmhuelle"), undefined, false);
    }
}

main();
