#target photoshop
function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'DTGDocPS.jsx'
    #include 'Job.jsx'
    #include 'JobFolder.jsx'
    #include 'Pathmaker.jsx'
    #include 'MonoNamer.jsx'
    #include 'InteractSwitch.jsx'
    #include 'ButtonList.jsx'

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