#target indesign

function main() {

     
	#include 'f_all.jsx'
	#include 'Pathmaker.jsx'

	var pm = new Pathmaker();

	var f = {
        load_place_gun_multipage_pdf : function (pdfs) 
        {
            if((pdfs != "") && (pdfs != null)) 
            {
		        var myDoc = app.activeDocument,
		            pG = myDoc.placeGuns,
		            allPagesLoaded = false,
		            myPDFFile,
		            pageCounter = 1,
		            nrOfPages = [],
		            pI,
		            rec,
		            pdf,
		            pdfPageNr,
		            myStartPage,
		            j,
		            maxJ = pdfs.length;

                for(j = 0, maxJ = pdfs.length; j < maxJ; j += 1) 
                {
					allPagesLoaded = false;
					myPDFFile = pdfs[j];

                    while (!allPagesLoaded) 
                    {
                        app.pdfPlacePreferences.pageNumber = pageCounter;
                        pG.loadPlaceGun(myPDFFile, false, {});
                        pI = pG.pageItems.item(pG.pageItems.length-1);
                        pdf = pI.pdfs.item(0);
                        pdfPageNr = pdf.properties.pdfAttributes.pageNumber;

                        if(pageCounter === 1) {
                            myStartPage = pdfPageNr;
                            pageCounter += 1;
                        
                        } else if (pdfPageNr !== myStartPage) {
                            pageCounter += 1;
                        
                        } else {
                            allPagesLoaded = true;
                            nrOfPages[j] = pageCounter-1;
                            pageCounter = 1;
                            pG.abortPlaceGun();
                        }
                    }
				}

				for(j = 0, maxJ = pdfs.length; j < maxJ; j += 1) {

					if(nrOfPages[j]) {
						pageCounter = 1;
						myPDFFile = pdfs[j];
						
						var i,
							maxI = nrOfPages[j];
						for(i = 0; i < maxI; i += 1) {
							app.pdfPlacePreferences.pageNumber = pageCounter;
							pG.loadPlaceGun(myPDFFile, false, {});
							pageCounter += 1;
						}
					}
				}
			}
		},

		create_rollen_doc : function (docSize) 
		{
		    var myDocPreset = app.documentPresets.item("filmRollePreset");
		    try {var myPresetName = myDocPreset.name}
		    catch (myError){myDocPreset = app.documentPresets.add({name:"filmRollePreset"})}

			with(myDocPreset) {
				facingPages = false;
				pageHeight = docSize.h;
				pageWidth = docSize.w;
				top = 0;
				left = 0;
				bottom = 0;
				right = 0;
			}

			var myDoc = app.documents.add(true, myDocPreset, {}),
				myPage = myDoc.pages.item(0),
				myDocument = app.activeDocument;

			with (myDocument.viewPreferences){
				horizontalMeasurementUnits = MeasurementUnits.millimeters;
				verticalMeasurementUnits = MeasurementUnits.millimeters;
				rulerOrigin = RulerOrigin.pageOrigin;
			}

			with (myDoc.documentPreferences) {
				pageOrientation = PageOrientation.PORTRAIT;
				pagesPerDocument = 1;
			}

			with (myDoc.textDefaults) {
				appliedFont = app.fonts.item('Myriad Pro');
				justification = Justification.CENTER_ALIGN;
				pointSize = 11;
				leading = 11;
				hyphenation = false;
			}

			// remove default Swatches
			var i, swatch;
			for (i = myDoc.swatches.length-1; i >= 0; i -= 1) {
				swatch = myDoc.swatches[i];
				if(swatch.name != 'Registration' && swatch.name != 'None' && swatch.name != 'Paper' && swatch.name != 'Black') {
					swatch.remove();
				}
			}

			// create layers
			var motivEbene = myDoc.layers.add({name:'motivEbene'});
			var hilfsLayer = myDoc.layers.item(1);
			hilfsLayer.name = 'hilfsLayer';

			// erstelle haarlinie am rand der filmrolle

			function make_haarlinie (p1,p2) {
				var mPage = myDoc.masterSpreads.item('A-Musterseite').pages.item(0);
				var myLine = mPage.graphicLines.add(hilfsLayer, LocationOptions.AT_BEGINNING);

				with(myLine) {
					paths.item(0).pathPoints.item(0).anchor = p1;
					paths.item(0).pathPoints.item(1).anchor = p2;
					strokeWeight = 2;
					strokeColor = myDoc.swatches.item('Registration');
				}
			}

			var r1 = [myDoc.masterSpreads.item('A-Musterseite').pages.item(0).bounds[3],0];
			var r2 = [myDoc.masterSpreads.item('A-Musterseite').pages.item(0).bounds[3], myDoc.masterSpreads.item('A-Musterseite').pages.item(0).bounds[2]];
			var l1 = [myDoc.masterSpreads.item('A-Musterseite').pages.item(0).bounds[1],0];
			var l2 = [myDoc.masterSpreads.item('A-Musterseite').pages.item(0).bounds[0], myDoc.masterSpreads.item('A-Musterseite').pages.item(0).bounds[2]];
			
			make_haarlinie(r1,r2);
			make_haarlinie(l1,l2);

			hilfsLayer.locked = true;
			myDoc.activeLayer = motivEbene;

			return myDoc;
		}		
	}

	var docSize = {
		w : 423,
		h : 1024
	}

	var myDoc = f.create_rollen_doc(docSize);

	//var pdfsToPlace = pm.folder('filmOut').openDlg("Select Files:", "*.pdf", true);
    //var myFolder = Folder.selectDialog();
    var myFolder = pm.folder('filmOut');
    var pdfsToPlace = myFolder.openDlg("Select Files:", "*.pdf", true);

    f.load_place_gun_multipage_pdf(pdfsToPlace);

	return myDoc;
}

main();