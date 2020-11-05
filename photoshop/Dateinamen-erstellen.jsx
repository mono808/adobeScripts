//@target photoshop

function main() {

    //@include 'require.jsx'  

    var PsBase = require('PsBase');//#include 'BaseDocPS.jsx'
    var job = require('job');
    var paths = require('paths');
    var saveOptions = require('saveOptions');

    //#include 'ButtonList.jsx'

    var psBase = new PsBase(app.activeDocument);

    job.set_nfo(app.activeDocument, true);
    paths.set_nfo(job.nfo);
    
    psBase.save_doc(paths.file('workingPs'), saveOptions.workingPs(), false,true);

};

if(app.activeDocument) {
    main();
}