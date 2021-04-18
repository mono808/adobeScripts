// this scripts helps with estimating the time needed to weed a plotted heat transfer
// it counts the number of cutouts, which have to be manually pealed off
// it also counts very small details, which have to remain in the design, and can therefore be timeconsuming to weed around

//@target illustrator

function calc () {

	var 
    myDoc = app.activeDocument,
    pIs = myDoc.pathItems,
    pI,
    i = pIs.length -1,    
    area = 0,
    length = 0,
    points = 0,
    ratio,
    cutOuts = 0,
    tinys = 0,
    tinyArea = -32,
    cm = 28.34645669,
    sqcm = cm*cm,
    fullArea = myDoc.pageItems[0].width * myDoc.pageItems[0].height,
    result = '';

    do{
        pI = pIs[i];        
        if(pI.area > 0) {cutOuts++;}
        if(pI.area < 0 && pI.area > tinyArea) {tinys++;}
        area -= pI.area;
        length += pI.length;
        points += pI.pathPoints.length;
    } while(i--)

    ratio = ((length/cm)*(points/1000)/(area/sqcm))+cutOuts*1.5+tinys*3;

    result += "Gesamtfläche:\t" + (fullArea/sqcm).toFixed(1) + "cm²\n";
    result += "Fläche:\t\t" + (area/sqcm).toFixed(1) + "cm²\n";
    result += "Kantenlänge:\t" + (length/cm).toFixed(1) + "cm\n"
    result += "Pfadpunkte:\t" + points + "\n";
    result += "Ausschnitte:\t" + cutOuts + "\n";
    result += "Minipopel:\t" + tinys + "\n";
    result += "Entgitter-Wert:\t" + ratio.toFixed(0);
    alert(result);
}

calc();