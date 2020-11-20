
#target indesign

function addPasser() {

     

    function getSettings() {

        var passerList = [
            'StandardCenter',
            'RasterQuerformat',
            'RasterHochformat'
        ];

        var result = {};

        var win = new Window('dialog', 'monos Passer-Script');

        win.setPnl = win.add('panel', [10,  10, 240, 60], 'Passer-Einstellungen:');
        win.okGrp =  win.add('group', [10, 70, 240, 100], 'Ready?');

        win.setPnl.pas =   win.setPnl.add('group',[5,  10, 225,  45]);

        win.setPnl.pas.txt = win.setPnl.pas.add('statictext',     [5,5,75,25], 'Passerart:');
        win.setPnl.pas.set = win.setPnl.pas.add('dropdownlist',  [80,5,210,25]);

        win.okGrp.yes = win.okGrp.add('button', [10, 5, 110, 30], 'Ok');
        win.okGrp.no =  win.okGrp.add('button', [120, 5, 220, 30], 'Abbrechen');

        var i,
            maxI,
            item;

        for (i = 0, maxI = passerList.length; i < maxI; i += 1) {
            item = win.setPnl.pas.set.add('item', passerList[i]);
        };
        win.setPnl.pas.set.selection = win.setPnl.pas.set.items[2];

        win.okGrp.yes.onClick = function () {
            result.pas = win.setPnl.pas.set.selection.text;
            win.close();
        }
        win.okGrp.no.onClick = function() {
            result = false;
            win.close();
        };

        win.show();
        return result
    }

    function getCoordinatesHoch() {
       
        var pB = {};
        pB.top =    sepRef.geometricBounds[0] - rPS.pDist - rPS.pSize/2;
        pB.left =   sepRef.geometricBounds[1] + rPS.pSize/2;
        pB.bottom = sepRef.geometricBounds[2] + rPS.pDist + rPS.pSize/2;
        pB.right =  sepRef.geometricBounds[3] - rPS.pSize/2;
        
        var coordinatesArray = [];
        coordinatesArray.push([pB.left,pB.top]);
        coordinatesArray.push([pB.right, pB.top ]);
        coordinatesArray.push([pB.left, pB.bottom]);
        coordinatesArray.push([pB.right, pB.bottom]);

        return coordinatesArray;
    }

    function getCoordinatesQuer() {
       
        var pB = {};
        pB.top = sepRef.geometricBounds[0] + rPS.pSize/2;
        pB.left = sepRef.geometricBounds[1] - rPS.pDist - rPS.pSize/2;
        pB.bottom = sepRef.geometricBounds[2] - rPS.pSize/2;
        pB.right = sepRef.geometricBounds[3] + rPS.pDist + rPS.pSize/2;

        var coordinatesArray = [];
        coordinatesArray.push([pB.left,pB.top]);
        coordinatesArray.push([pB.right, pB.top ]);
        coordinatesArray.push([pB.left, pB.bottom]);
        coordinatesArray.push([pB.right, pB.bottom]);

        return coordinatesArray;
    }

    function getCoordinatesTopCenter() {
        
        var vLine = myDoc.guides.item("vLine"),
            coordinatesArray = [],
            xyPoint;
        
        xyPoint = [];
        xyPoint[0] = vLine.location;
        xyPoint[1] = sepRef.geometricBounds[0] - pS.pDist - pS.pSize*pS.aspectRatio/2;
        coordinatesArray.push(xyPoint);
        
        return coordinatesArray;
    }

    function getCoordinatesBottomCenter() {
        
        var vLine = myDoc.guides.item("vLine"),
            coordinatesArray = [],
            xyPoint;
        
        xyPoint = [];
        xyPoint[0] = vLine.location;
        xyPoint[1] = sepRef.geometricBounds[2] + pS.pDist + pS.pSize*pS.aspectRatio/2;
        coordinatesArray.push(xyPoint);

        return coordinatesArray;
    }

    function create_centerMark  (xy, name) {
        var pS = {
            stroke1 : 0.25,
            stroke2 : 0.6,
            circle : 4.5,
            dia1 : 10,
            dia2 : 10,
            dia3 : 16.5,
            distance : 8,
        };
        var myLayer = app.activeDocument.activeLayer;
        var pGroup = [], 
            centerMark, 
            x = xy[0],
            y = xy[1];
          
        // create Kreuz

        var circle =    myPage.ovals.add       (myLayer, undefined, undefined, {strokeWeight:pS.stroke2, fillColor:noColor, strokeColor:regColor, geometricBounds: [y-pS.circle/2, x-pS.circle/2, y+pS.circle/2, x+pS.circle/2]});
        var gLH =       myPage.graphicLines.add(myLayer, undefined, undefined, {strokeWeight:pS.stroke2, fillColor:noColor, strokeColor:regColor, geometricBounds: [y, x-pS.dia2/2, y, x+pS.dia2/2] });
        var gLV =       myPage.graphicLines.add(myLayer, undefined, undefined, {strokeWeight:pS.stroke2, fillColor:noColor, strokeColor:regColor, geometricBounds: [y-pS.circle/2, x, y+pS.circle/2, x] });
        var gLHhair =   myPage.graphicLines.add(myLayer, undefined, undefined, {strokeWeight:pS.stroke1, fillColor:noColor, strokeColor:regColor, geometricBounds: [y, x-pS.dia3/2, y, x+pS.dia3/2] });
        var gLVhair =   myPage.graphicLines.add(myLayer, undefined, undefined, {strokeWeight:pS.stroke1, fillColor:noColor, strokeColor:regColor, geometricBounds: [y-pS.circle, x, y+pS.circle, x] });
        
        pGroup.push(circle,gLH,gLHhair,gLV,gLVhair);
        centerMark = myPage.groups.add(pGroup);
        centerMark.name = name;
       
        return centerMark;
    }

    function createRasterPasser(xyPoint) {

        var pSize = rPS.pSize,
            lineWeight = rPS.lineWeight,
            pDist = rPS.pDist,
            x = xyPoint[0],
            y = xyPoint[1];

        var bounds1 =  [y-pSize/2, x-lineWeight/2, y+pSize/2, x+lineWeight/2],
            bounds2 =  [y-lineWeight/2, x-pSize/2, y+lineWeight/2, x+pSize/2],
            oBBounds = [y-pSize*0.85/2, x-pSize*0.85/2, y+pSize*0.85/2, x+pSize*0.85/2],
            oMBounds = [oBBounds[0]+lineWeight, oBBounds[1]+lineWeight, oBBounds[2]-lineWeight, oBBounds[3]-lineWeight],
            oSBounds = [y-pSize*0.5/2, x-pSize*0.5/2, y+pSize*0.5/2, x+pSize*0.5/2];

        var rec1 = myPage.rectangles.add({geometricBounds:bounds1, fillColor: myDoc.colors.item('Registration'), strokeColor:myDoc.swatches.item('None')}),
            rec2 = myPage.rectangles.add({geometricBounds:bounds2, fillColor: myDoc.colors.item('Registration'), strokeColor:myDoc.swatches.item('None')}),
            ovalBig =   myPage.ovals.add({geometricBounds:oBBounds, fillColor: myDoc.colors.item('Registration'), strokeColor:myDoc.swatches.item('None')}),
            ovalMed =   myPage.ovals.add({geometricBounds:oMBounds, fillColor: myDoc.colors.item('Registration'), strokeColor:myDoc.swatches.item('None')}),
            ovalSmall = myPage.ovals.add({geometricBounds:oSBounds, fillColor: myDoc.colors.item('Registration'), strokeColor:myDoc.swatches.item('None')});
        
        var cross = rec1.addPath(rec2),
            center = ovalSmall.excludeOverlapPath(cross),
            circle = ovalBig.excludeOverlapPath(ovalMed),
            passer = center.addPath(circle);
    }

    ///////////////////////////////////////////
    //     Start Script
    ///////////////////////////////////////////

    var settings = getSettings();
    if(!settings) {
        alert('Script cancelled!');
        return
    };

    var myDoc = app.activeDocument;
    var myPage = myDoc.pages.item(0);
    var regColor = myDoc.colors.item('Registration');
    var noColor = myDoc.swatches.item('None');

    try {
        var mLayer = myDoc.layers.item('motivEbene');
        var check = mLayer.name;
        mLayer.visible = false;
    } catch (e) {}
    
    try {
        myDoc.layers.item('infoEbene').name;
        var pLayer = myDoc.layers.item('infoEbene');
    } catch (e) {
        var pLayer = myDoc.layers.add({name:'infoEbene'});
    } finally {
        myDoc.activeLayer = pLayer;
    }  
    
    // Settings for RasterPasser
    var rPS = {
        pDist : 3,
        lineWeight : 0.1,
        pSize : 4
    };

    // Settings for Passer
    var pS = {
        pDist : 8,
        lineWeight : 0.5,
        pSize : 15,
        aspectRatio : 0.33
    }

    var sepRef = myDoc.allGraphics[0],
        sepWidth = sepRef.geometricBounds[3] - sepRef.geometricBounds[1],
        sepHeight = sepRef.geometricBounds[2] - sepRef.geometricBounds[0];

    // store measurementUnits, set to millimeters
    var oldXUnits = app.activeDocument.viewPreferences.horizontalMeasurementUnits;
    var oldYUnits = app.activeDocument.viewPreferences.verticalMeasurementUnits;
    app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
    app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;

    var pageWidth = myPage.bounds[3] - myPage.bounds[1];
    var pageHeight = myPage.bounds[2] - myPage.bounds[0];
    var pageAspect = pageHeight / pageWidth;

    var i, maxI, xyPoint;

    switch(settings.pas) {
        case 'StandardCenter' :
            var topPoints = getCoordinatesTopCenter();
            for(i = 0, maxI = topPoints.length; i < maxI; i += 1) {
                xyPoint = topPoints[i];
                create_centerMark(xyPoint, 'topMark');
            }
            var bottomPoints = getCoordinatesBottomCenter();
            for(i = 0, maxI = bottomPoints.length; i < maxI; i += 1) {
                xyPoint = bottomPoints[i];
                create_centerMark(xyPoint,'bottomMark');
            }
            break;
        case 'RasterHochformat' : 
            var coordinatesArray = getCoordinatesHoch();

            for(i = 0, maxI = coordinatesArray.length; i < maxI; i += 1) {
                xyPoint = coordinatesArray[i];
                createRasterPasser(xyPoint);
            }
            break;
        case 'RasterQuerformat' :
            var coordinatesArray = getCoordinatesQuer();

            for(i = 0, maxI = coordinatesArray.length; i < maxI; i += 1) {
                xyPoint = coordinatesArray[i];
                createRasterPasser(xyPoint);
            }
            break;
    };

    try {
        mLayer.visible = true;
    } catch(e) {}

    // myMeasureSwitch.reset_units();
    app.activeDocument.viewPreferences.horizontalMeasurementUnits = oldXUnits;
    app.activeDocument.viewPreferences.verticalMeasurementUnits = oldYUnits;
    // viewPrefSwitch.reset();

};

addPasser();
