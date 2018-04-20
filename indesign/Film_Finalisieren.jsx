#target indesign
function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'augment_objects.jsx'
    #include 'Job.jsx'
    #include 'JobFolder.jsx'
    #include 'MonoNamer.jsx'
    #include 'MonoFilm.jsx'
    #include 'MonoMockup.jsx'
    #include 'MonoGraphic.jsx'
    #include 'MonoTextil.jsx'
    #include 'MonoPrint.jsx'
    #include 'Pathmaker.jsx'
    #include 'PasserFab.jsx'
    #include 'MonoSep.jsx'
    #include 'Typeahead.jsx'
    #include 'TexAdder.jsx'

  
    var job = new Job(null, false);
    var pm = new Pathmaker(job.nfo);

    var myDoc = app.activeDocument;
    var monoFilm = new MonoFilm(myDoc);

    try{myDoc.layers.item('motivEbene').visible = false;} catch(e){}

    monoFilm.add_centermarks ();

    monoFilm.add_jobInfo (job);

    monoFilm.add_spotInfo_numbered ();
    
    monoFilm.position_textFrames();
    
    monoFilm.resize_page();

    try{myDoc.layers.item('motivEbene').visible = true;} catch(e){}

    monoFilm.save (job, true, false);

    monoFilm.print(job, true, false);




}
main();