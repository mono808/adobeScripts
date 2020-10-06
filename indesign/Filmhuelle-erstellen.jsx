#target indesign

#include 'Job.jsx'
#include 'JobFolder.jsx'
#include 'MonoFilm.jsx'
#include 'MonoNamer.jsx'
#include 'MonoPrint.jsx'
#include 'MonoSep.jsx'
#include 'Pathmaker.jsx'
#include 'universal_functions.jsx'

function createTextFrame (doc)
{
    var myPage = doc.pages.item(0);
    var myTextFrame = myPage.textFrames.add();

    myTextFrame.geometricBounds = myGetBounds(doc, myPage);
    myTextFrame.contents = "This is some example text."
    return myTextFrame;
}

function myGetBounds (myDoc, myPage)
{
    var myPageWidth = myDoc.documentPreferences.pageWidth;
    var myPageHeight = myDoc.documentPreferences.pageHeight;
    
    if(myPage.side == PageSideOptions.leftHand){
        var myX2 = myPage.marginPreferences.left;
        var myX1 = myPage.marginPreferences.right;
    } else {
        var myX1 = myPage.marginPreferences.left;
        var myX2 = myPage.marginPreferences.right;
    }

    var myY1 = myPage.marginPreferences.top;
    var myX2 = myPageWidth - myX2;
    var myY2 = myPageHeight - myPage.marginPreferences.bottom;

    return [myY1, myX1, myY2, myX2];
}

function checkCreateStyle (type, name) 
{
    var myDoc = app.activeDocument;
    var existingStyles;
    var newStyle = null;

    switch(type) {
        case 'cell' :
            existingStyles = myDoc.cellStyles;
        break;
        case 'paragraph' :
            existingStyles = myDoc.paragraphStyles;
        break;
        case 'table' : 
            existingStyles = myDoc.tableStyles;
        break;
        case 'character':
            existingStyles = myDoc.characterStyles;
        break;
        case 'object' :
            existingStyles = myDoc.objectStyles;
        break;
        case 'textDefaults' :
            newStyle = myDoc.textDefaults;
        break;
    }
    
    if(!newStyle) {
        try{
            newStyle = existingStyles.item(name);
            var check = newStyle.name;
        } catch (myError){  
            newStyle = existingStyles.add({name:name});
        }
    }
    return newStyle;
}

function createStyles (doc) 
{
    var defaultPStyle;
    defaultPStyle = checkCreateStyle('paragraph', 'defaultPStyle');
    with (defaultPStyle){
        fillColor = doc.colors.item('Black');
        pointSize = 11;                
        leading = "11 points";
        spaceBefore = 0;
        justification = Justification.LEFT_ALIGN;
        try{appliedFont = app.fonts.item("Myriad Pro")} catch(e){}
        try{fontStyle = "Regular"} catch(e){}              
    } 

    var jobPStyle;
    jobPStyle = checkCreateStyle('paragraph', 'jobPStyle');
    with(jobPStyle) {
        basedOn = defaultPStyle;
        pointSize = 16;
        leading = "16 points";
        justification = Justification.CENTER_ALIGN;
        fontStyle = "Bold";
    }

    var posPStyle;
    posPStyle = checkCreateStyle('paragraph', 'posPStyle');
    with(posPStyle){
        basedOn = jobPStyle;
        pointSize = 14;                
        leading = "14 points";
    }

    var colorsPStyle;
    colorPStyle = checkCreateStyle('paragraph', 'colorsPStyle');
    with(colorPStyle){
        basedOn = defaultPStyle;
        justification = Justification.RIGHT_ALIGN;
        hyphenation = false;
    }

    var defaultCStyle;
    defaultCStyle = checkCreateStyle('cell', 'defaultCStyle');
    with(defaultCStyle) {
        leftInset = 2;
        rightInset = 2;
        bottomInset = 2;
        topInset = 2;

        topEdgeStrokeTint = 20;
        leftEdgeStrokeTint = 20;
        bottomEdgeStrokeTint = 20;
        rightEdgeStrokeTint = 20;

        topEdgeStrokeWeight = 2;            
        leftEdgeStrokeWeight = 2;
        bottomEdgeStrokeWeight = 2;
        rightEdgeStrokeWeight = 2;            

        topEdgeStrokeColor = doc.swatches.item("Black");
        leftEdgeStrokeColor = doc.swatches.item("Black");
        bottomEdgeStrokeColor = doc.swatches.item("Black");
        rightEdgeStrokeColor = doc.swatches.item("Black");
    }

    
    var colorsCStyle;
    colorsCStyle = checkCreateStyle('cell', 'colorsCStyle');
    with(colorsCStyle) {
        basedOn = defaultCStyle;
        appliedParagraphStyle = doc.paragraphStyles.item('colorsPStyle');            
    }

    var posCStyle;
    posCStyle = checkCreateStyle('cell', 'posCStyle');
    with(posCStyle){
        basedOn = defaultCStyle;
        appliedParagraphStyle = doc.paragraphStyles.item('posPStyle');
    }


    var jobCStyle;
    jobCStyle = checkCreateStyle('cell', 'jobCStyle');
    with(jobCStyle){
        basedOn = defaultCStyle;
        appliedParagraphStyle = doc.paragraphStyles.item('jobPStyle');
    }

    var defaultTStyle;
    defaultTStyle = checkCreateStyle('table', 'defaultTStyle');
    with(defaultTStyle){
        bodyRegionCellStyle = 'defaultCStyle';
        headerRegionCellStyle = 'jobCStyle';
    }
}    

function createTable (doc) 
{

    var tableTempString = "Client1\tClient 2\tJobNr\tjobName\rPos1\tPos2\tPos3\tPos4\rColors1\tColors2\tColors3\tColors4\rimage1\timage2\timage3\timage4";
    
    var myTF = createTextFrame(doc);        
    myTF.contents = tableTempString;
    myTF.fillColor = doc.swatches.item('Paper');
    myTF.texts.item(0).convertToTable();
    
    var myTable = myTF.tables.item(0);
    myTable.appliedTableStyle = 'defaultTStyle';
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

function createFrame (cell) 
{
    var doc = app.activeDocument;
    var rectOpts = {
        fillColor : doc.swatches.item('None'),
        fillTint : 100,
        frameFittingOptions: {
            autoFit : true,
            fittingOnEmptyFrame : EmptyFrameFittingOptions.PROPORTIONALLY,
            bottomCrop : -15,
            leftCrop : -15,
            topCrop : -15,
            rightCrop : -15
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

function prepCell (cell) 
{
    cell.contents = '';
    cell.insertionPoints[0].contents = "\r";
    cell.properties = {
        clipContentToCell:true,
        autoGrow:false,
        firstBaselineOffset:FirstBaseline.fixedHeight,
        minimumFirstBaselineOffset:0,
        topInset:1,
        leftInset:1,
        bottomInset:1,
        rightInset:1
    };      
    cell.paragraphs[0].properties = {
        leading:0,
        justification:Justification.centerAlign,
        leftIndent:1,
        rightIndent:1,
        firstLineIndent:1,
        lastLineIndent:1,
    };
}

function import_graphic_to_cell (graphic, cell) 
{
    if (graphic && cell) {
        prepCell(cell);
        var targFrame = createFrame(cell);        
        targFrame.place(graphic);
    }
}

function fill_table_with_printNfo (monoPrints, myTable, monoNamer) 
{
    var jobRow = myTable.rows.item(0);          
    jobRow.cells.everyItem().appliedCellStyle = 'jobCStyle';
    
    var posRow = myTable.rows.item(1);
    posRow.cells.everyItem().appliedCellStyle = 'posCStyle';
    
    var colorsRow = myTable.rows.item(2);
    colorsRow.cells.everyItem().appliedCellStyle = 'colorsCStyle';

    for (var i = 0; i < monoPrints.length; i++ ) {
        var monoFilm = new MonoFilm(monoPrints[i].film);
        var use_longNames = true;
        var spotNames = monoFilm.get_spotNames(use_longNames);
        monoFilm.close(SaveOptions.YES);
        
        var posCell = posRow.cells.item(i);
        posCell.contents = monoNamer.name('printId', monoPrints[i].id);

        var colorCell = colorsRow.cells.item(i);    
        colorCell.contents = spotNames.join(', ');
    }

    var tFHeight = myTable.parent.geometricBounds[2]-myTable.parent.geometricBounds[0]-1;
    var rowsHeight = jobRow.height + posRow.height + colorsRow.height;
    
    var imageRow = myTable.rows.item(3);
    imageRow.height = tFHeight-rowsHeight;

    for (var i = 0; i < monoPrints.length; i++ ) {
        var imageCell = myTable.rows.item(3).cells.item(i);
        var myImage = monoPrints[i].preview;
        import_graphic_to_cell(myImage,imageCell);
    }
}

function fill_table_with_jobNfo (table2Fill, job) 
{
    var jobRow = table2Fill.rows.item(0);
    
    var clCell = jobRow.cells.item(0).merge(jobRow.cells.item(1));
    clCell.contents = job.nfo.client;
    clCell.appliedCellStyle = 'jobCStyle';

    var jobNrCell = jobRow.cells.item(1);
    jobNrCell.contents = job.nfo.jobNr;
    jobNrCell.appliedCellStyle = 'jobCStyle';

    var jobNameCell = jobRow.cells.item(2);
    jobNameCell.contents = job.nfo.jobName;
    jobNameCell.appliedCellStyle = 'jobCStyle';        
}

function create_aufkleber () 
{
    var docWidth = 207;
    var docHeight = 146;

    var myDocPreset = app.documentPresets.item("filmhuellePreset");
    try {var myPresetName = myDocPreset.name}
    catch (myError){myDocPreset = app.documentPresets.add({name:"filmhuellePreset"})}

    with(myDocPreset) {
        facingPages = false;
        pageHeight = docHeight;
        pageWidth = docWidth;
        top = 20;
        left = 3;
        bottom = 20;
        right = 3;
    }

    var myDoc = app.documents.add(true, myDocPreset, {});
    var myPage = myDoc.pages.item(0);
    var myDocument = app.activeDocument;
    myDoc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;

    with (myDocument.viewPreferences){
        horizontalMeasurementUnits = MeasurementUnits.millimeters;
        verticalMeasurementUnits = MeasurementUnits.millimeters;
        rulerOrigin = RulerOrigin.pageOrigin;
    }

    createStyles(myDoc);

    var myTable = createTable(myDoc);

    myDoc.textDefaults.hyphenation = false;

    return myDoc;
}

function main () 
{
    var job = new Job(null, false, false);
    var pm = new Pathmaker(job.nfo);
    var jobFolder = new JobFolder(job.nfo.folder);
    var monoNamer = new MonoNamer();

    var doc = create_aufkleber();
    var myPage = doc.pages.item(0);
    var myTable = myPage.textFrames.item(0).tables.item(0);
    
    fill_table_with_jobNfo(myTable, job);
    
    var monoPrints = jobFolder.get_prints();
    
    if(monoPrints.length < 1) {
        alert('Keine Siebdruck-Dateien gefunden, Filmhuelle wird nicht erstellt');
        doc.close(SaveOptions.NO);
        return;
    }

    var sdPrints = [];
    for (var i = 0; i < monoPrints.length; i++) {
        if(monoPrints[i].film) {
            sdPrints.push(monoPrints[i]);
        }
    }
         
    sdPrints.sort(function(a,b) {
        var sideA = monoNamer.name('side', a.id);
        var sideB = monoNamer.name('side', b.id);
        return sideA < sideB;
    });
    
    var pageCount = Math.ceil(sdPrints.length/4); //calculate number of pages needed (4 graphics per page)
    
    // create duplicates of myPage if needed (already filled with jobnfo only, empty elsewhere)
    for(var i=1; i < pageCount; i++){
        myPage.duplicate(LocationOptions.AT_END);        
    }

    // use the array of empty pages to fill with 4 prints each
    for(i = 0; i < doc.pages.length; i++ ){
        var fourtett = sdPrints.splice(0,4);  
        var myPage = doc.pages[i];
        var myTable = myPage.textFrames.item(0).tables.item(0);
        fill_table_with_printNfo(fourtett, myTable, monoNamer);
    }
    
    if(app.activeDocument.saved == false){
        save_file(pm.file('filmhuelle'), undefined, false);
    }
}

main ();
