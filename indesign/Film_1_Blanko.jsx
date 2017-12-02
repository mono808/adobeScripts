#target indesign

function main () {

	function createCenterPasser(xyArray) {
	    var myDoc = app.activeDocument,
	        myPage = myDoc.pages.item(0),
	        lineWeight = 0.6,
	        pSize = 15,
	        pC = xyArray,
	        pLayer = myDoc.layers.item('passerEbene');

	    var bounds1 = [pC[1]-pSize/6, pC[0]-lineWeight/2, pC[1]+pSize/6, pC[0]+lineWeight/2],
	        bounds2 = [pC[1]-lineWeight/2, pC[0]-pSize/2, pC[1]+lineWeight/2, pC[0]+pSize/2];

	    var rec1 = myPage.rectangles.add({
	    		geometricBounds:bounds1,
	    		fillColor: myDoc.colors.item('Registration'),
	    		strokeColor : myDoc.swatches.item('None'),
	    		itemLayer:pLayer}),
	        rec2 = myPage.rectangles.add({
	        	geometricBounds:bounds2,
	        	fillColor: myDoc.colors.item('Registration'),
	        	strokeColor : myDoc.swatches.item('None'),
	        	itemLayer:pLayer});

		rec1.strokeColor = myDoc.swatches.item('None');
		rec2.strokeColor = myDoc.swatches.item('None');

	    var passer = rec1.excludeOverlapPath(rec2);
	    passer.strokeColor = myDoc.swatches.item('None');
	    
	    return passer
	}

	function createGuideLines(guideObjs) {
		for (var i = 0, maxI = guideObjs.length; i < maxI; i += 1) {
			var guideObj = guideObjs[i]
			var myGuide = myDoc.guides.add(undefined, {
				orientation: guideObj.vh,
				location:guideObj.loc,
				name:guideObj.name,
				fitToPage:false});
		}
	}

	function createGuideRecs(coorObj) {
		var myDoc = app.activeDocument,
			pC = {x:myDoc.documentPreferences.pageWidth/2, y:myDoc.documentPreferences.pageHeight/2},
			pageGB = myDoc.pages.item(0).bounds;

		var myBounds = [];
		switch (coorObj.align) {
			case 'top' :
				myBounds[0] = pageGB[0];
				myBounds[1] = pC.x - coorObj.w/2;
				myBounds[2] = pageGB[0]+coorObj.h;
				myBounds[3] = pC.x+coorObj.w/2;
			break;
			case 'center' :
				myBounds[0] = pC.y - coorObj.h/2;
				myBounds[1] = pC.x - coorObj.w/2;
				myBounds[2] = pC.y + coorObj.h/2;
				myBounds[3] = pC.x + coorObj.w/2;
			break;			
		}
		var rec = myPage.rectangles.add({itemLayer:hilfsLayer,name:coorObj.name, geometricBounds:myBounds, locked:true, fillColor:bgColor});
		return rec
	}

	var docWidth = 420,
		docHeight = 550;

	var guideLines = [
		{name: 'hLine',loc: 0, vh: HorizontalOrVertical.horizontal},
		{name: 'vLine',loc: docWidth/2, vh: HorizontalOrVertical.vertical},
	]

	var guideRecs = [
		{w:docWidth,h:docHeight,name:'max',align:'top'},
		{w:300,h:420,name:'a3',align:'top'},
		{w:120,h:300,name:'ar',align:'top'},
	];	
    
    var myDocPreset = app.documentPresets.item("filmShirtPreset");
    try {var myPresetName = myDocPreset.name}
    catch (myError){myDocPreset = app.documentPresets.add({name:"filmShirtPreset"})}

	with(myDocPreset) {
		facingPages = false;
		pageHeight = docHeight;
		pageWidth = docWidth;
		top = 0;
		left = 0;
		bottom = 0;
		right = 0;
	}

	var myDoc = app.documents.add(true, myDocPreset, {}),
		myPage = myDoc.pages.item(0),
		myDocument = app.activeDocument,
		myLayoutWin = myDocument.layoutWindows.item(0);
	myLayoutWin.viewDisplaySetting = ViewDisplaySettings.OPTIMIZED;
	myDoc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;

	with (myDocument.viewPreferences){
		horizontalMeasurementUnits = MeasurementUnits.millimeters;
		verticalMeasurementUnits = MeasurementUnits.millimeters;
		rulerOrigin = RulerOrigin.pageOrigin;
	}

	with (myDoc.textDefaults) {
		appliedFont = app.fonts.item('Myriad Pro');
		justification = Justification.CENTER_ALIGN;
		pointSize = 9;
		leading = 9;
		hyphenation = false;
	}

	/* remove default Swatches */
	for (var i = myDoc.swatches.length-1; i >= 0; i -= 1) {
		var swatch = myDoc.swatches[i];
		if(swatch.name != 'Registration' && swatch.name != 'None' && swatch.name != 'Paper' && swatch.name != 'Black') {
			swatch.remove();
		}
	}


	/* create layers */
	var hilfsLayer = myDoc.layers.item(myDoc.layers.item.length-1)
	with (hilfsLayer) {
		name = 'hilfsLayer';
		printable = false;
		visible = true;
		locked = false;
	}
	var motivEbene = myDoc.layers.add({name:'motivEbene'});
	var infoEbene = myDoc.layers.add({name:'infoEbene'});
	var farbenEbene = myDoc.layers.add({name:'farbenEbene'});
	var passerEbene = myDoc.layers.add({name:'passerEbene'});

	var myMasterSpread = myDoc.masterSpreads.item('A-Musterseite');
	var bgRec = myMasterSpread.rectangles.add({itemLayer:hilfsLayer,name:'BG', geometricBounds:[0,0,docHeight, docWidth]});
	var bgColor = myDoc.colors.add({
		space:ColorSpace.RGB,
		model:ColorModel.PROCESS,
		colorValue:[214,255,207],
		name:'bgColor'});
	bgRec.fillColor = bgColor;	


	myDoc.activeLayer = motivEbene;
    /*
	// create Guides	
	// var vGuide = myDoc.guides.add(undefined, {
	// 		orientation:HorizontalOrVertical.vertical,
	// 		location:myDoc.documentPreferences.pageWidth/2,
	// 		name:'vLine',
	// 		fitToPage:false});

	// var hGuide = myDoc.guides.add(undefined, {
	// 		orientation:HorizontalOrVertical.horizontal,
	// 		location:pageGB[0],
	// 		name:'hLine',
	// 		fitToPage:false});
    */
	createGuideLines(guideLines);

	for (var i = 0, maxI = guideRecs.length; i < maxI; i += 1) {
		var recInfos = guideRecs[i];
		var rec = createGuideRecs(recInfos);
	}
	hilfsLayer.locked = true;
	return myDoc;
}

main();