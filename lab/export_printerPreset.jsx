#target indesign
(function () {

    var exportDiff = function (presetName) {
        var basePP = app.printerPresets.itemByName(presetName);
        var newPP = app.printerPresets.add();
        with(newPP) {
            //name = "printMockup";

        }
        
        var f = File('~/documents/'+ presetName + '.txt');
        f.open ('w');
        for(var p in basePP) {
            try{
                if(basePP[p] && (basePP[p] != newPP[p])) {
                    f.writeln (p + ' - ' + basePP[p].toSource());
                }
            } catch(e) {

            }

        }
        f.close ();
    }

    var getPP = function (presetName) {
        try {
            var myPP = app.printerPresets.itemByName(presetName);
            $.writeln(myPP.printer)
            $.writeln(myPP.ppd)
            $.writeln('printerPreset ' + myPP.name + 'exists, will be removed');
            myPP.remove();
        } catch (e) {        
        }

        var props = {
            name : presetName,
            colorOutput : ColorOutputModes.SEPARATIONS,
            sendImageData : ImageDataTypes.ALL_IMAGE_DATA,
            pagePosition : PagePositions.CENTERED,
            paperSize : "A4 210 x 297 mm",
            textAsBlack : true,
            flattenerPresetName : "[Mittlere Auflösung]"
        }

        myPP = app.printerPresets.add(props);
        return myPP;
    }

    // var presets = ['printMockup', 'monoFilms', 'filmhuelle', 'monoRolle'];
    // for (var i=0, len=presets.length; i < len ; i++) {
    //   exportDiff(presets[i]);
    // };

    var myPP = getPP('monoFilms');
    app.activeDocument.print(false, myPP);

})();