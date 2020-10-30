//@target photoshop

function main () {

    //@include 'require.jsx'

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
}

main();