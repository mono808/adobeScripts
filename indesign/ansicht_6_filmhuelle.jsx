    #target indesign

function create_aufkleber () {

    #include '/c/capri-links/scripts/includes/MonoNamer.jsx'
    #include '/c/capri-links/scripts/includes/f_id.jsx'

    function createStyles() {

        var myDoc = app.activeDocument;

        var defaultPStyle;
        defaultPStyle = f_id.checkCreateStyle('paragraph', 'defaultPStyle');
        with (defaultPStyle){
            fillColor = myDoc.colors.item('Black');
            pointSize = 11;                
            leading = "11 points";
            spaceBefore = 0;
            justification = Justification.LEFT_ALIGN;
            try{appliedFont = app.fonts.item("Myriad Pro")} catch(e){}
            try{fontStyle = "Regular"} catch(e){}              
        } 

        var jobPStyle;
        jobPStyle = f_id.checkCreateStyle('paragraph', 'jobPStyle');
        with(jobPStyle) {
            basedOn = defaultPStyle;
            pointSize = 16;
            leading = "16 points";
            justification = Justification.CENTER_ALIGN;
            fontStyle = "Bold";
        }

        var posPStyle;
        posPStyle = f_id.checkCreateStyle('paragraph', 'posPStyle');
        with(posPStyle){
            basedOn = jobPStyle;
            pointSize = 14;                
            leading = "14 points";
        }
    
        var colorsPStyle;
        colorPStyle = f_id.checkCreateStyle('paragraph', 'colorsPStyle');
        with(colorPStyle){
            basedOn = defaultPStyle;
            justification = Justification.RIGHT_ALIGN;
            hyphenation = false;
        }

        var defaultCStyle;
        defaultCStyle = f_id.checkCreateStyle('cell', 'defaultCStyle');
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

            topEdgeStrokeColor = myDoc.swatches.item("Black");
            leftEdgeStrokeColor = myDoc.swatches.item("Black");
            bottomEdgeStrokeColor = myDoc.swatches.item("Black");
            rightEdgeStrokeColor = myDoc.swatches.item("Black");
        }

        
        var colorsCStyle;
        colorsCStyle = f_id.checkCreateStyle('cell', 'colorsCStyle');
        with(colorsCStyle) {
            basedOn = defaultCStyle;
            appliedParagraphStyle = myDoc.paragraphStyles.item('colorsPStyle');            
        }

        var posCStyle;
        posCStyle = f_id.checkCreateStyle('cell', 'posCStyle');
        with(posCStyle){
            basedOn = defaultCStyle;
            appliedParagraphStyle = myDoc.paragraphStyles.item('posPStyle');
        }


        var jobCStyle;
        jobCStyle = f_id.checkCreateStyle('cell', 'jobCStyle');
        with(jobCStyle){
            basedOn = defaultCStyle;
            appliedParagraphStyle = myDoc.paragraphStyles.item('jobPStyle');
        }

        var defaultTStyle;
        defaultTStyle = f_id.checkCreateStyle('table', 'defaultTStyle');
        with(defaultTStyle){
            bodyRegionCellStyle = 'defaultCStyle';
            headerRegionCellStyle = 'jobCStyle';
        }
    }    

    function createTable() {

        function createTextFrame(){
            var myDoc = app.documents.item(0),
                myPage = myDoc.pages.item(0),
                myTextFrame = myPage.textFrames.add();

            myTextFrame.geometricBounds = myGetBounds(myDoc, myPage);
            myTextFrame.contents = "This is some example text."
            return myTextFrame;
        }

        function myGetBounds(myDoc, myPage){
            var myPageWidth = myDoc.documentPreferences.pageWidth,
                myPageHeight = myDoc.documentPreferences.pageHeight
            
            if(myPage.side == PageSideOptions.leftHand){
                var myX2 = myPage.marginPreferences.left;
                var myX1 = myPage.marginPreferences.right;
            } else {
                var myX1 = myPage.marginPreferences.left;
                var myX2 = myPage.marginPreferences.right;
            }

            var myY1 = myPage.marginPreferences.top;
                myX2 = myPageWidth - myX2,
                myY2 = myPageHeight - myPage.marginPreferences.bottom;

            return [myY1, myX1, myY2, myX2];
        }

        var tableTempString = "Client1\tClient 2\tJobNr\tDesign\rPos1\tPos2\tPos3\tPos4\rColors1\tColors2\tColors3\tColors4\rimage1\timage2\timage3\timage4";
        
        var myTF = createTextFrame();        
        myTF.contents = tableTempString;
        myTF.fillColor = myDoc.swatches.item('Paper');
        myTF.texts.item(0).convertToTable();
        
        var myTable = myTF.tables.item(0);
        myTable.appliedTableStyle = 'defaultTStyle';
        var jobRow = myTable.rows.item(0),          
            posRow = myTable.rows.item(1),
            colorRow = myTable.rows.item(2);

        jobRow.minimumHeight = 15;
        jobRow.verticalJustification = VerticalJustification.CENTER_ALIGN;

        posRow.minimumHeight = 9;
        posRow.verticalJustification = VerticalJustification.CENTER_ALIGN;

        colorRow.minimumHeight = 10;

        myTable.cells.everyItem().contents = "";

        return myTable;
    }

    var docWidth = 207,
        docHeight = 146;

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

    var myDoc = app.documents.add(true, myDocPreset, {}),
        myPage = myDoc.pages.item(0),
        myDocument = app.activeDocument;
    myDoc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;

    with (myDocument.viewPreferences){
        horizontalMeasurementUnits = MeasurementUnits.millimeters;
        verticalMeasurementUnits = MeasurementUnits.millimeters;
        rulerOrigin = RulerOrigin.pageOrigin;
    }

    createStyles();

    var myTable = createTable();

    with (myDoc.textDefaults) {
        //appliedParagraphStyle = myDoc.paragraphStyles.item('defaultPStyle');
        hyphenation = false;
    }

    return myDoc;
}

function main (doc) {
	
    #includepath '/c/capri-links/scripts/includes'
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'f_id_mock.jsx'    
    #include 'Job.jsx'
    #include 'save_Options.jsx'
    #include 'MonoNamer.jsx'

    var job = new Job(null, false);

    function import_graphic_to_cell(graphic, cell) 
    {
        if (graphic == null) {exit();}

        function createFrame(cell) 
        {
            var doc = app.activeDocument,
                rect = cell.insertionPoints[0].rectangles.add({
                fillColor : doc.swatches.item('None'),
                fillTint : 100,
                frameFittingOptions:{
                    autoFit : true,
                    fittingOnEmptyFrame : EmptyFrameFittingOptions.PROPORTIONALLY,
                    bottomCrop : -15,
                    leftCrop : -15,
                    topCrop : -15,
                    rightCrop : -15
                }
            });

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
        
        function prepCell(cell) 
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
            }       
            cell.paragraphs[0].properties = {
                leading:0,
                justification:Justification.centerAlign,
                leftIndent:1,
                rightIndent:1,
                firstLineIndent:1,
                lastLineIndent:1,
            }
        }
        
        prepCell(cell);
        var targFrame = createFrame(cell);        
        targFrame.place(graphic);      
    }

    function fill_table_with_printNfo(printsArray, myTable) 
    {
        var jobRow = myTable.rows.item(0),          
            posRow = myTable.rows.item(1),
            colorsRow = myTable.rows.item(2),
            imageRow = myTable.rows.item(3);
        jobRow.cells.everyItem().appliedCellStyle = 'jobCStyle';
        posRow.cells.everyItem().appliedCellStyle = 'posCStyle';
        colorsRow.cells.everyItem().appliedCellStyle = 'colorsCStyle';

        var i,maxI, print, posCell, colorCell;
        textLoop : for (i = 0, maxI = printsArray.length; i < maxI; i+=1) 
        {
            print = printsArray[i];
            posCell = posRow.cells.item(i);
            posCell.contents = monoNamer.name('printId', print.nfo.printId);
            colorCell = colorsRow.cells.item(i);

            for(var j = 0; j < print.filmInfos.spotsArray.length; j++) {
                print.filmInfos.spotsArray[j] = monoNamer.name('color', print.filmInfos.spotsArray[j]);
            }
        
            colorCell.contents = print.filmInfos.spotsArray.join(', ');
        }

        var tFHeight = myTable.parent.geometricBounds[2]-myTable.parent.geometricBounds[0]-1;
        var rowsHeight = jobRow.height + posRow.height + colorsRow.height;
        imageRow.height = tFHeight-rowsHeight;

        var imageCell, myImage;
        imageLoop : for (i = 0, maxI = printsArray.length; i < maxI; i+=1)
        {
            print = printsArray[i];
            imageCell = myTable.rows.item(3).cells.item(i);
            myImage = print.preview;

            import_graphic_to_cell(myImage,imageCell);
        }
    }

    function fill_table_with_jobNfo(table2Fill) 
    {
        var jobRow,clCell1,clCell2,clCell,
            jobNrCell,
            designCell;

        jobRow = table2Fill.rows.item(0);
        clCell1 = jobRow.cells.item(0);
        clCell2 = jobRow.cells.item(1);
        clCell = clCell1.merge(clCell2);
        clCell.contents = job.nfo.client;
        clCell.appliedCellStyle = 'jobCStyle';

        jobNrCell = jobRow.cells.item(1);
        jobNrCell.contents = job.nfo.jobNr;
        jobNrCell.appliedCellStyle = 'jobCStyle';

        designCell = jobRow.cells.item(2);
        designCell.contents = job.nfo.design;
        designCell.appliedCellStyle = 'jobCStyle';        
    }

    var doc = app.activeDocument,
        firstPage = doc.pages.item(0),
        firstTable = firstPage.textFrames.item(0).tables.item(0),
        myPrints = f_id_mock.getPrints(job.nfo.folder, 'SD'),
        monoNamer = new MonoNamer();
    
    myPrints.sort(function(a,b) {
         return monoNamer.name_side(a.nfo.printId) - monoNamer.name_side(b.nfo.printId);
    });

    fill_table_with_jobNfo(firstTable);

    
    var i, maxI, fourtett, myPage, pageArray = [];
    //calculate number of pages needed (4 graphics per page)
    pageCount = Math.ceil(myPrints.length/4);
    
    // create duplicates of firstpage if needed (already filled with jobnfo only, empty elsewhere)
    for(i=0; i < pageCount; i++){
        myPage = i == 0 ? firstPage : firstPage.duplicate(LocationOptions.AT_END);
        pageArray.push(myPage);
    }

    // use the array of empty pages to fill with 4 prints each
    for(i=0;i < pageArray.length; i+=1){
        fourtett = myPrints.splice(0,4);  
        myPage = pageArray[i];
        myTable = myPage.textFrames.item(0).tables.item(0),
        fill_table_with_printNfo(fourtett, myTable);
    }
    
    if(app.activeDocument.saved == false){
        f_all.saveFile(mofi.file('filmhuelle'), undefined, false);
    }
}

function check() {
    return true;
}


if(check()){
    var doc = create_aufkleber();
    main(doc);
}