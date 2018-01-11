#target Photoshop
function check_histogram (chan) 
{
    var visState = chan.visible;
    if(!visState) {chan.visible = true;}
    
    var
    hg = chan.histogram,
    totalPixels = chan.parent.width.as('px') * chan.parent.height.as('px'),
    totalArea = chan.parent.width.as('cm') * chan.parent.height.as('cm'),
    i = 254,
    // blackness = overall darkness of the channel = ink coverage on press
    // 100% black pixel -> darkness +1, 50% black pixel -> darkness +0.5
    // hg[0] -> amount of 100% black pixels    
    blackness = hg[0],
    greyPixels = 0;
    
    do {
        blackness += hg[i]*((255-i)/255);
        greyPixels += hg[i]; //counting greyPixels to check if channel is bitmapped -> only black/white pixels
        i--;
    }while(i>0)

    chan.visible = visState;

    return {
        name : chan.name,
        inkCoverage : blackness/totalPixels,
        area : totalArea*(blackness/totalPixels),
        // if the overall blackness equals the number of black pixels
        // -> there must be no grey pixels -> true 1bit bitmap
        isOneBit : (greyPixels == 0)
    };
}

function check_ink_coverage (myDoc) 
{
    var oldUnits = app.preferences.rulerUnits;
    var report = {
        totalArea : myDoc.width.as('cm') * myDoc.height.as('cm'),
        spotChannels : [],
        allOneBit : true,
    };

    app.preferences.rulerUnits = Units.PIXELS;

    for(var i=0,maxI = myDoc.channels.length; i < maxI; i+=1) {
        var ch = myDoc.channels[i];
        if(ch.kind == ChannelType.SPOTCOLOR) {
            var chanRep = check_histogram(ch);
            if(!chanRep.isOneBit) {report.allOneBit = false}
            report.spotChannels.push(chanRep);
        }
    }

    return report;
}

function main (report) 
{

    #includepath '/c/repos/adobeScripts1/includes'
    #include 'AreaDialog2.jsx'


    var myDoc = app.activeDocument;
    var report = check_ink_coverage(myDoc);
    
    
    if(!report) return;
    
    //sort pathItems by spotcolor, putting them into indivdual "spot arrays"
    //sep.sort_by_spotColor(sep.pathItems);

    //sep.get_totalArea();
    var inkDialog = new AreaDialog(report.spotChannels, report.totalArea).create_win().show();

}

main();