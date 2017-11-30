/*
This script gos through the selected Items / all pathItems
and adds all used fill & strokecolors to the swatches palette
*/

#target illustrator

function main () {
    var doc = app.activeDocument;
    if(app.selection.length > 0) {
        var sel = doc.selection;
    } else {
        var sel = doc.pathItems;
    }
    var i = sel.length-1;
    do{
    	var pI = sel[i];
        if(pI.filled && !check_swatches(doc, pI.fillColor)) create_swatch(doc, pI.fillColor);
        if(pI.stroked && !check_swatches(doc, pI.strokeColor)) create_swatch(doc, pI.strokeColor);    	
    }while(i--);
}

function check_swatches (doc, color) {
	for (var i = 0; i < doc.swatches.length; i++) {
		if(match_colors(doc.swatches[i].color, color)) return true;
	}
	return false;
}

function create_swatch (doc, color) {

    // Create the new swatch using the above color
    var swatch = doc.swatches.add();
    swatch.color = color;
    return swatch;
}

function match_colors(c1, c2) {
	var class1 = c1.constructor.name;
    if(class1 != c2.constructor.name) return false;
    switch(class1) {
		case 'RGBColor' : return match_RGBColors(c1,c2);
		break;
		case 'CMYKColor' : return match_CMYKColors(c1,c2);
		break;
		case 'GrayColor' : return match_GrayColors(c1,c2);
		break;
    }

	return false;
}

function match_RGBColors(c1, c2) {
    return (
        c1.red.toFixed(0) == c2.red.toFixed(0) &&
        c1.green.toFixed(0) == c2.green.toFixed(0) &&
        c1.blue.toFixed(0) == c2.blue.toFixed(0)
    )
}

function match_CMYKColors(c1, c2) {
    return (  
        c1.cyan.toFixed(0) == c2.cyan.toFixed(0) &&
        c1.magenta.toFixed(0) == c2.magenta.toFixed(0) &&
        c1.yellow.toFixed(0) == c2.yellow.toFixed(0) &&
        c1.black.toFixed(0) == c2.black.toFixed(0)
    ) 
}

function match_GrayColors(c1, c2) {
    return (
        c1.gray.toFixed(0) == c2.gray.toFixed(0)
    )
}

main();