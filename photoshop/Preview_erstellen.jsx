//@target photoshop
//@include 'require.jsx'
$.level = 0;
(function () {

    var job = require('job');
    var paths = require('paths');
    var iaSwitch = require('interactionSwitch');
    var PsSiebdruckPreview = require('PsSiebdruckPreview');

    job.set_nfo(app.activeDocument, true);
    paths.set_nfo(job.nfo);

    iaSwitch.set('none');

    var saveFile = paths.file('previewPs');

    var previewDoc = new PsSiebdruckPreview(app.activeDocument);   
    previewDoc.make(saveFile);

    app.refresh();

    iaSwitch.reset();
})()