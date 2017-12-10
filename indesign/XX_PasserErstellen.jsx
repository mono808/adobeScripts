
#target indesign

function addPasser() {

    #includepath '/c/repos/adobeScripts1/includes/'

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

    function createPasser(xyPoint) {
        var x = xyPoint[0],
            y = xyPoint[1];
            
        var bounds1 = [y-pS.pSize/2*pS.aspectRatio, x-pS.lineWeight/2, y+pS.pSize/2*pS.aspectRatio, x+pS.lineWeight/2],
            bounds2 = [y-pS.lineWeight/2, x-pS.pSize/2, y+pS.lineWeight/2, x+pS.pSize/2];

        var rec1 = myPage.rectangles.add({geometricBounds:bounds1, fillColor: myDoc.colors.item('Registration'),itemLayer:pLayer}),
            rec2 = myPage.rectangles.add({geometricBounds:bounds2, fillColor: myDoc.colors.item('Registration'),itemLayer:pLayer});
        
        var passer = rec1.excludeOverlapPath(rec2);

        return passer;
    }
    
    function createObenPasser(xyPoint) {
        var passer = createPasser(xyPoint),
            x = xyPoint[0],
            y = xyPoint[1];

        var tfBounds = [];
        var myPointSize = pS.pSize/2*pS.aspectRatio*2.83464567;
        tfBounds[0] = y - pS.pSize/2*pS.aspectRatio;
        tfBounds[1] = x;
        tfBounds[2] = y - pS.lineWeight/2;
        tfBounds[3] = x + pS.pSize/2;
        var myTF = myPage.textFrames.add({geometricBounds:tfBounds, contents: 'Oben', itemLayer:pLayer});
        var myText = myTF.paragraphs[0];
        myText.pointSize = myPointSize;
        myText.fillColor = myDoc.colors.item('Registration');
        //myText.strokeColor = myDoc.colors.item('Ohne');

        var mySelection = [];
        mySelection.push(passer);
        mySelection.push(myTF);
        var groupedPasser = myPage.groups.add(mySelection);
        return groupedPasser;
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

    var settings = getSettings();
    if(!settings) {
        alert('Script cancelled!');
        return
    };

    try {
        var mLayer = app.activeDocument.layers.item('motivEbene');
        var check = mLayer.name;
        mLayer.visible = false;
    } catch (e) {}

    var myDoc = app.activeDocument,
        myPage = myDoc.pages.item(0);

    viewPrefSwitch.set('fast');
    
    // Settings for RasterPasser
    var rPS = {
        pDist : 3,
        lineWeight : 0.25,
        pSize : 8
    };

    // Settings for Passer
    var pS = {
        pDist : 3,
        lineWeight : 0.5,
        pSize : 15,
        aspectRatio : 0.33
    }

    var sepRef = myDoc.allGraphics[0],
        sepWidth = sepRef.geometricBounds[3] - sepRef.geometricBounds[1],
        sepHeight = sepRef.geometricBounds[2] - sepRef.geometricBounds[0];

    measureUnitSwitch.set(MeasurementUnits.millimeters);

    var myPage = myDoc.pages[0],
        pageWidth = myPage.bounds[3] - myPage.bounds[1],
        pageHeight = myPage.bounds[2] - myPage.bounds[0],
        pageAspect = pageHeight / pageWidth;

    try {
        myDoc.layers.item('passerEbene').name;
        var pLayer = myDoc.layers.item('passerEbene');
    } catch (e) {
        var pLayer = myDoc.layers.add({name:'passerEbene'});
    }

    myDoc.activeLayer = pLayer;

    var i, maxI, xyPoint;

    switch(settings.pas) {
        case 'StandardCenter' :
            var topPoints = getCoordinatesTopCenter();
            for(i = 0, maxI = topPoints.length; i < maxI; i += 1) {
                xyPoint = topPoints[i];
                createObenPasser(xyPoint);
            }
            var bottomPoints = getCoordinatesBottomCenter();
            for(i = 0, maxI = bottomPoints.length; i < maxI; i += 1) {
                xyPoint = bottomPoints[i];
                createPasser(xyPoint);
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

    myMeasureSwitch.reset_units();

    viewPrefSwitch.reset();

};

addPasser();