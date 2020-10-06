#target indesign

function reframe_item (item, newBounds) 
{
    if(item.constructor.name === 'Page') {
        var rec = item.rectangles.add({ geometricBounds: [newBounds[0], newBounds[1], newBounds[2], newBounds[3]] });
    } else {
        if(item.parentPage) {
            var rec = item.parentPage.rectangles.add({ geometricBounds: [newBounds[0], newBounds[1], newBounds[2], newBounds[3]] });
        } else {
            var rec = item.parent.rectangles.add({ geometricBounds: [newBounds[0], newBounds[1], newBounds[2], newBounds[3]] });
        }
    }

    var topLeft = rec.resolve(AnchorPoint.TOP_LEFT_ANCHOR,CoordinateSpaces.SPREAD_COORDINATES)[0],
        bottomRight = rec.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR,CoordinateSpaces.SPREAD_COORDINATES)[0],
        corners = [topLeft, bottomRight];

    rec.remove();
    
    item.reframe(CoordinateSpaces.SPREAD_COORDINATES, corners);
}

function fit_frame_to_text (tF) 
{

    tF.fit(FitOptions.FRAME_TO_CONTENT);
    
    var oldBounds,
        newBounds;
    
    while (tF.overflows) {
        oldBounds = tF.geometricBounds;
        newBounds = [oldBounds[0], oldBounds[1], oldBounds[2]+1, oldBounds[3]];
        reframe_item(tF, newBounds);
    }
    
    while (!tF.overflows) {
        oldBounds = tF.geometricBounds;
        newBounds = [oldBounds[0], oldBounds[1]+1, oldBounds[2], oldBounds[3]-1];
        reframe_item(tF, newBounds);
    }

    // underline characters get cut off, so add 1mm below the last line
    oldBounds[2] += 1;
    reframe_item(tF, oldBounds);
}

function main () {
	if(app.activeDocument && app.selection.length = 1 && app.selection[0] instanceof TextFrame) {
		fit_frame_to_text(app.selection[0]);
	}
}

main();