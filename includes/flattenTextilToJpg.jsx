function flattenPS (myArgs) {
  var sourceDoc = app.open(new File(myArgs.sourceFile));
  var path = sourceDoc.path;
  var visibleLayerSets = myArgs.visibleLayerSets;
  
  /* create fileName containing the active layerSets */
  var namePart = sourceDoc.name.substring(0, sourceDoc.name.lastIndexOf('.'));
  namePart += '_-';
  for (var i=0, len=visibleLayerSets.length; i < len ; i++) {
    namePart += '_';
    namePart += visibleLayerSets[i];
  };

  var doc = sourceDoc.duplicate(namePart + '.psd');

  /* activate the correct layerSets */
  var layerSet, name;
  for (var i=0, len=doc.layerSets.length; i < len ; i++) {
    layerSet = doc.layerSets[i];
    name = layerSet.name;
    for (var j=0, lenJ=visibleLayerSets.length; j < lenJ ; j++) {
      if(name === visibleLayerSets[j]) {
        layerSet.visible = true;
        break;
      } else {
        layerSet.visible = false;
      }
    };
  };

  doc.flatten();

  var jpgOptions = new JPEGSaveOptions();
  jpgOptions.embedColorProfile = true;
  
  var jpgFile = new File(sourceDoc.path + '/' + namePart + '.jpg');

  doc.saveAs(jpgFile, jpgOptions);
  doc.close(SaveOptions.DONOTSAVECHANGES);
  sourceDoc.close(SaveOptions.DONOTSAVECHANGES);
  return jpgFile;
}

var myArgs = eval({sourceFile:"\\\\cs-server16\\caprishare\\Produktion\\Druckvorstufe\\textilien\\!Dummies\\T-Shirt Männer.psd", visibleLayerSets:["ForestGreen", "Shirt"]});
flattenPS(myArgs);