#target photoshop-60.064

#includepath '/c/capri-links/scripts/includes'
#include 'augment_objects.jsx'
#include 'universal_functions.jsx'
#include 'photoshop_functions.jsx'
#include 'statics.jsx'
#include 'variables.jsx'

function main() {
       
    //var job = new Job(null, true, false);

    //---------------------------------------------------------------------
    // create the separation file
    
    var sourceDoc = app.activeDocument,
    pantoneChannels = check_for_pantone(sourceDoc);

    if( pantoneChannels.length > 0) {
        var alertStr = '';
        alertStr += 'Dokument enthält Pantone-Farben in folgenden Kanälen:\n\n';
        alertStr += pantoneChannels.join('\n');
        alertStr += '\n\nBitte erst in RGB Farben wandeln!';
        alert(alertStr);
        return false;
    }

    if(!get_spot_channels(sourceDoc)) {
        alert('Document contains no SpotColor Channels, script cancelled');
        return false;
    }
    
    var report = check_ink_coverage(sourceDoc);
    if(!report){return}

    var previewDoc = sourceDoc.duplicate();

    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.MM;

    if (previewDoc.componentChannels.length > 0) {
        previewDoc.changeMode(ChangeMode.RGB);
    } else {
        add_RGB_channels(previewDoc);
    }

    //var previewType = f_all.choose_from_array(['Vollton','Raster'], undefined, 'Vollton oder Rasterseparation?');

    if(report.allOneBit) {
        previewDoc.flatten();        
        create_layers_from_spotChannels(previewDoc);
        previewDoc.artLayers.getByName('Ebene 0').remove();
        //save_file(mofi.file('previewPs'), save_ops.previewPS(), false);
    } else {
        previewDoc.flatten();
        merge_spotChannels(previewDoc);
        //save_file(mofi.file('previewPs'), save_ops.previewPS(), false);
    }
    
    app.preferences.rulerUnits = originalRulerUnits;
}

main();
