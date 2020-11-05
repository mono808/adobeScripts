//@target photoshop
//@include 'require.jsx'

(function () {
    
    var PsDtg = require('PsDtg');
    var saveOptions = require('saveOptions');
    var job = require('job');
    var paths = require('paths');
    var iaSwitch = require('interactionSwitch');
    
    job.set_nfo(null, true);
    paths.set_nfo(job.nfo);

    iaSwitch.set('none');

    var psDtg = new PsDtg(app.activeDocument);

    var saveFile = paths.file('dtgPrintTif');
    var saveOpts = saveOptions.dtgPrintPsTif();
    psDtg.make(saveFile, saveOpts);

    iaSwitch.reset();
    
})();
