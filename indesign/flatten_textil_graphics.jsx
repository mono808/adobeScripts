
function sendScriptToPhotoshop (PSfunction, scriptArgs) {
    var retval = true;

    // Create the message object
    var bt = new BridgeTalk();
    var serializedArgs = scriptArgs.toSource();
    $.writeln(serializedArgs);

    bt.target = 'photoshop';
    bt.body = "var SnpSentMessage = {}; SnpSentMessage.main = " + PSfunction.toString() + ";";
    bt.body += "SnpSentMessage.main(";
    bt.body += serializedArgs;
    bt.body += ")";
    
    bt.onError = function(errObj)
    {
        $.writeln('BT returned an error:\n');
        $.writeln(errObj.body);
    }
    
    bt.onResult = function(resObj)
    {
        // The result of executing the code is the last line of the script that was executed in the target (Photoshop)
        $.writeln('BridgeTalk result:' + resObj.body);
        retval = eval(resObj.body);

    }

    // Send the message, wait max 30 sec for response
    bt.send(30);
    
    return retval;
}



function read_file (aFile) {     
  if(aFile && aFile instanceof File) {
        aFile.open('r', undefined, undefined);
        aFile.encoding = "UTF-8";      
        aFile.lineFeed = "Windows";
        var success = aFile.read();
        aFile.close();
        return success;
  }
}

function get_graphicLayerNames (myImage) {
    // get ref to the parent object, otherwise the script will fuckup ...
    var graphicLayers = myImage.graphicLayerOptions.graphicLayers;
    var activeLayerNames = [];
    var gL;

    for (var j=0, lenJ=graphicLayers.length; j < lenJ ; j++) {
        gL = graphicLayers[j];
        if(gL.currentVisibility === true) {
            activeLayerNames.push(gL.name);
        }
    };

    return activeLayerNames;
}

function changeImage(image, aFile) {
    var rec = image.parent;
    //image.remove();

    if(aFile.constructor.name !== 'File') {
        aFile = new File(decodeURI(aFile));
    }
    rec.place(aFile);
    //rec.fit(FitOptions.CONTENT_TO_FRAME);
    rec.allGraphics[0].itemLink.unlink();
}

function ai_run (myArgs) {

}

function ps_run (myArgs) {
    $.writeln(myArgs.toSource());

    var sourceDoc = app.open(new File(decodeURI(myArgs.sourcePath)));
    var path = sourceDoc.path;
    var visibleOjectLayers = myArgs.visibleOjectLayers;
    
    var doc = sourceDoc.duplicate();

    /* activate the correct layerSets */
    var layer, name;
    for (var i=0, len=doc.layers.length; i < len ; i++) {
        layer = doc.layers[i];
        for (var j=0, lenJ=visibleOjectLayers.length; j < lenJ ; j++) {
            // only toggle layers which are at top level, since those are available from indesign graphicLayerObject
            if(layer.parent.constructor.name === 'Document') {
                if(layer.name === visibleOjectLayers[j]) {
                    layer.visible = true;
                    break;
                } else {
                    layer.visible = false;
                }
            }
        }
    }

    doc.flatten();

    var jpgOptions = new JPEGSaveOptions();
    jpgOptions.embedColorProfile = true;
    
    var jpgFile = new File(decodeURI(myArgs.destPath));

    doc.saveAs(jpgFile, jpgOptions);
    doc.close(SaveOptions.DONOTSAVECHANGES);
    sourceDoc.close(SaveOptions.DONOTSAVECHANGES);

    var retval = encodeURI(jpgFile);
    return retval.toSource();
}

function indd_run () {
    if(app.selection.length > 0) {
        for (var i=0, len=app.selection.length; i < len ; i++) {
            var selItem = app.selection[i];
            if(selItem.constructor.name === 'Rectangle') {
                var graphic = selItem.graphics[0];
            } else {
                var graphic = selItem;
            }

            if(graphic.imageTypeName === 'Photoshop' || graphic.imageTypeName === 'PDF') {
                var visibleOjectLayers = get_graphicLayerNames(graphic);
                var sourcePath = graphic.itemLink.filePath;

                /* create filename containing the visible object layers */
                
                var filename = sourcePath.substring(0, sourcePath.lastIndexOf('.'));
                var sourceExtension = sourcePath.substring(sourcePath.lastIndexOf('.'), sourcePath.length-1);
                var destExtension = '.jpg';
                for (var i=0, len=visibleOjectLayers.length; i < len ; i++) {
                filename += '_-_';
                filename += visibleOjectLayers[i];
                };

                var destPath = filename + destExtension;

                var btArgs = {};
                btArgs.sourcePath = encodeURI(sourcePath);
                btArgs.destPath = encodeURI(destPath);
                btArgs.visibleOjectLayers = visibleOjectLayers;

               var jpgPath = sendScriptToPhotoshop(ps_run, btArgs);
               var jpgFile = new File(decodeURI(jpgPath));
               changeImage(graphic, jpgFile);
               jpgFile.remove();
            }
        }
    }
}

$.writeln('script started');
if(BridgeTalk.appName == 'indesign') {
    $.writeln('running in indesign');
    indd_run();

// just for testing the photoshop script without sending it through bridgeTalk
} else if (BridgeTalk.appName == 'photoshop') {
    $.writeln('running in photoshop');
    var args = eval({sourcePath:"%5C%5Ccs-server16.dc-krueger.local%5CCapriShare%5CProduktion%5CDruckvorstufe%5Ctextilien%5Csweats%5CStanley%20Cultivator.psd", destPath:"%5C%5Ccs-server16.dc-krueger.local%5CCapriShare%5CProduktion%5CDruckvorstufe%5Ctextilien%5Csweats%5CStanley%20Cultivator_-_French_Navy_Front.jpg", visibleOjectLayers:["French_Navy_Front"]});
    // var args = eval({sourcePath:"%5C%5Ccs-server16%5Ccaprishare%5CProduktion%5CDruckvorstufe%5Ctextilien%5C!Dummies%5CT-Shirt%20M%C3%A4nner-Test.psd", destPath:"%5C%5Ccs-server16%5Ccaprishare%5CProduktion%5CDruckvorstufe%5Ctextilien%5C!Dummies%5CT-Shirt%20M%C3%A4nner-Test_-_ForestGreen_-_Shirt.jpg", visibleOjectLayers:["ForestGreen", "Shirt"]});
    ps_run(args);
} else if (BridgeTalk.appName == 'illustrator') {
    $.writeln('running script in illustrator');

}