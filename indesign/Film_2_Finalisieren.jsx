#target indesign
#targetengine 'main'

function main() {

    create_passer = function (obenPasser, istTasche) 
    {
        function create_graphicLine (point1, point2, strkWeight) 
        {
            var gL = myPage.graphicLines.add({fillColor: noColor, strokeColor : regColor, strokeWeight : strkWeight});
            gL.paths.item(0).pathPoints.item(0).anchor = point1;
            gL.paths.item(0).pathPoints.item(1).anchor = point2;
            pGroup.push(gL);
            return gL;
        }

        function get_coordinates (location)
        {
            var doc = app.activeDocument,
                sepRef = doc.layers.item('motivEbene').allGraphics[0],
                sepHeight = sepRef.geometricBounds[2]-sepRef.geometricBounds[0],
                sepWidth = sepRef.geometricBounds[3]-sepRef.geometricBounds[1],
                vLine = doc.guides.item("vLine"),
                coordinatesArray = [];

            switch(location) {
                case 'top' :
                    x = vLine.location;
                    y = sepRef.geometricBounds[0] - pS.distance - pS.height1/2;
                break;
                case 'bottom' :
                    x = vLine.location;
                    y = sepRef.geometricBounds[2] + pS.distance + pS.height1/2;
                break;
                case 'left' :
                    x = sepRef.geometricBounds[1] - pS.distance - pS.width1/2;
                    y = sepRef.geometricBounds[0] + sepHeight/2;
                break;
                case 'right' :
                    x = sepRef.geometricBounds[3] + pS.distance + pS.width1;
                    y = sepRef.geometricBounds[0] + sepHeight/2;
                break;
            }
            return [x,y];
        }

        var pS = {
            stroke1 : 0.3,
            stroke2 : 0.6,
            circle : 4,
            width1 : 15,
            width2  :6.75,
            height1 : 6,
            height2 : 5,
            distance : 3,
        };

        var doc = app.activeDocument,
            myPage = doc.pages.item(0),
            pLayer = doc.layers.item('passerEbene'),
            oldActiveLayer = doc.activeLayer,
            regColor = doc.colors.item('Registration'),
            noColor = doc.swatches.item('None'),
            paper = doc.swatches.item('Paper'),
            pGroup = [];
            
        var centerPoint,x,y;
        centerPoint = obenPasser ? get_coordinates('top') : get_coordinates('bottom');
        x = centerPoint[0];
        y = centerPoint[1];
            
        doc.activeLayer = pLayer;

        var cBounds, c;
        cBounds = [y-pS.circle/2, x-pS.circle/2, y+pS.circle/2, x+pS.circle/2];
        c = myPage.ovals.add({geometricBounds : cBounds, fillColor: noColor, strokeColor : regColor, strokeWeight : pS.stroke2});
        pGroup.push(c);
        
        var gLH1,gLH2,gLV1,gLV2;
        gLH1 = create_graphicLine([x-pS.width1/2, y],  [x+pS.width1/2, y],  pS.stroke1);            
        gLH2 = create_graphicLine([x-pS.width2/2, y],  [x+pS.width2/2, y],  pS.stroke2);
        gLV1 = create_graphicLine([x, y-pS.height1/2], [x, y+pS.height1/2], pS.stroke1);
        gLV2 = create_graphicLine([x, y-pS.height2/2], [x, y+pS.height2/2], pS.stroke2);

        if(obenPasser) 
        {
            var tfBounds = [],myTF,
                myPointSize = pS.height1*1.3;

            tfBounds[0] = gLV1.geometricBounds[0];
            tfBounds[1] = x+pS.stroke2/2;
            tfBounds[2] = y-pS.stroke2/2;
            /* weil das wort "beutel" länger ist als "shirt", muss der rahmen breiter sein */
            tfBounds[3] = istTasche ? x+myPointSize*1.25 : x+myPointSize;
            
            myTF = myPage.textFrames.add({geometricBounds:tfBounds, fillColor: paper});
            myTF.contents = istTasche ? 'BEUTEL' : 'SHIRT';
            
            var myText = myTF.paragraphs[0];
            myText.pointSize = myPointSize;
            myText.fillColor = regColor;
            myText.strokeColor = noColor;
            pGroup.push(myTF);
        }

        return myPage.groups.add(pGroup);
    };
    create_text_frame = function (layerName,frameName) 
    {
        var doc = app.activeDocument,
            myPage = doc.pages.item(0),
            tfWidth = 120,
            tfHeight = 10,
            textBounds = [],
            myLayer = doc.layers.item(layerName);

        textBounds[0] = 0;
        textBounds[1] = doc.documentPreferences.pageWidth/2 - tfWidth/2;
        textBounds[2] = tfHeight;
        textBounds[3] = doc.documentPreferences.pageWidth/2 + tfWidth/2;

        var tF = myPage.textFrames.add( { geometricBounds : textBounds, contents : ' ', itemLayer : myLayer} );
        with(tF.textFramePreferences) {
            autoSizingType = AutoSizingTypeEnum.OFF;
            useNoLineBreaksForAutoSizing = false;
        }

        tF.name = frameName;
        return tF;
    };
    create_jobInfos_textFrame = function (job) 
    {
        var doc = app.activeDocument;
        var infoSpot = doc.colors.item('Registration');
        var infoTF = create_text_frame('infoEbene', 'infoTextFrame');
        var infoText = infoTF.paragraphs[0];
        var mN = new MonoNamer();
            
        infoText.fillColor = infoSpot;

        var infoArray = []
        infoArray.push(job.nfo.client);
        infoArray.push(job.nfo.jobNr);
        infoArray.push('JobName: ' + job.nfo.jobName);
        infoArray.push('DruckID: ' + mN.name('printId', job.nfo.printId));
        infoArray.push('BxH: ' + f_id.get_width(sepRef) + 'x' + f_id.get_height(sepRef) + 'mm');
        infoArray.push(f_all.get_kuerzel());
        
        infoTF.contents = infoArray.join(' | ');
        
        f_id.fitFrameToText(infoTF);
        return infoTF;
    };
    create_spotColors_textFrame = function () 
    {
        var doc = app.activeDocument,
            colorTF = create_text_frame('farbenEbene', 'colorTextFrame'),
            colorText = colorTF.paragraphs[0];
        colorTF.contents = '';
        
        var mN = new MonoNamer(),
            i,
            maxI      = doc.swatches.length,
            colStory  = doc.stories[doc.stories.length-1],
            colIndex  = 1,
            colMax    = maxI-5, /*swatches minus defaults like noColor, regColor ...*/
            charIndex = 0,
            spot,
            spotName,
            oldBounds,
            newBounds,
            spotChars;                

        for (i = 4, maxI ; i < maxI; i += 1)  {
            
            if ((doc.swatches[i] != 'Registration') && (doc.swatches[i].name != 'bgColor') ) {                              
                spot = doc.swatches[i];
                spotName = '#' + colIndex + '/' + colMax + ' ' + mN.name('color', (spot.name)) + ' ';
                
                colorTF.contents += spotName;
                colorTF.fit(FitOptions.FRAME_TO_CONTENT);
                
                spotChars = colStory.characters.itemByRange(charIndex, charIndex + spotName.length-1);
                spotChars.fillColor = spot;
                charIndex += spotName.length;
                
                /*if(colIndex > 3 && colIndex == ((colMax/2).toFixed(0)) ) {
                   colorTF.contents += '\n';
                }
                colIndex += 1;*/
            }
        }

        f_id.fitFrameToText(colorTF);

        return colorTF;
    };

    #include '/c/capri-links/scripts/includes/augment_objects.jsx'
    #include '/c/capri-links/scripts/includes/f_all.jsx'    
    #include '/c/capri-links/scripts/includes/Job.jsx'
    #include '/c/capri-links/scripts/includes/save_Options.jsx'
    #include '/c/capri-links/scripts/includes/f_id.jsx'
    #include '/c/capri-links/scripts/includes/MonoNamer.jsx'
    #include '/c/capri-links/scripts/includes/InteractSwitch.jsx'

    var job = new Job(null, false, false);

    var iASwitch = new InteractSwitch();
    iASwitch.set('none');

    f_id.viewPrefSwitch.set('fast');

    f_id.measureUnitSwitch.set(MeasurementUnits.millimeters);

    var myDoc = app.activeDocument,
        myPage = myDoc.pages[0],
        sepRef = myDoc.layers.item('motivEbene').allGraphics[0];

    try {
        var mLayer = myDoc.layers.item('motivEbene');
        var check = mLayer.name;
        mLayer.visible = false;        
    } catch (e) {}        

    var istTasche = (function () {
        var beutelRegExp = /Beutel|Tasche/;
        return beutelRegExp.test(job.nfo.printId);
    })();

    /* create Passer  */  
    var pOben = create_passer(true, istTasche);
    pOben.name = 'passerOben';

    var pUnten = create_passer(false);
    pUnten.name = 'passerUnten';

    /* create Textframes containing jobInfos and used SpotColors*/
    var colorTF = create_spotColors_textFrame();
    var infoTF = create_jobInfos_textFrame(job);

    /* position textFrames above/below separation*/
    if(istTasche) {
        f_id.move_item1_below_item2(colorTF, pUnten, 1);
        f_id.move_item1_below_item2(infoTF, colorTF, 1);
    } else {
        f_id.move_item1_above_item2(colorTF, pOben, 1);
        f_id.move_item1_above_item2(infoTF, colorTF, 1);
    }
    /*
    // add left/right passer if separation is very wide
    // if((f.calculate_item_aspect_ratio(sepRef) > 1.75) || (job.nfo.printPos === 'lBrust') || (job.printPos === 'rBrust') ) {
    //     var pLeftXY = f.get_passer_coordinates(rPS, 'left');
    //     var pLeft = f.createRasterPasser(pLeftXY, rPS);
    //     pLeft.name = 'passerLeft';

    //     var pRightXY = f.get_passer_coordinates(rPS, 'right');
    //     var pRight = f.createRasterPasser(pRightXY, rPS);
    //     pRight.name = 'passerRight';
    // }
    */
    f_id.fitPage2Art();

    try {mLayer.visible = true;} catch (e) {}
    
    f_id.print2PS(mofi.file('filmPs'), 'monoFilms');
    
    f_id.save_doc (mofi.file('film'), undefined, false);
    
    /*f_all.copy_file_via_bridgeTalk(mofi.file('filmPdf'), mofo.folder('filmdaten'), false);*/

    f_id.viewPrefSwitch.set('normal');

    iASwitch.reset();

    f_id.measureUnitSwitch.reset();
}

function check () {
    if(app.documents.length > 0) {
        if(app.activeDocument.layers.item('motivEbene').allGraphics.length > 0) {
            return true;
        } else {
            alert('documents has no placed sep graphic on layer "motivEbene"');
            return false;
        }
    } else {
        alert('no open docuemnts!');
        return false;
    }
}

if (check()) {
    main();
}


