//@target photoshop
function main () {

    //@include 'require.jsx'
    
    var PsDtg = require('PsDtg');
    var job = require('job');
    var paths = require('paths');
    var iaSwitch = require('interactionSwitch');
    

    //var job = new Job(app.activeDocument, true);
    var pm = new Pathmaker();

    var iaSwitch = new InteractSwitch();
    iaSwitch.set('none');

    var dtgObj = Object.create(dtgDocPS);
    dtgObj.startDoc = app.activeDocument;

    if(dtgObj.check()) {
        dtgObj.make();
    }

    iaSwitch.reset();
}
main();