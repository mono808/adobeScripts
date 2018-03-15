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

    var monoFilm = new MonoFilm(app.activeDocument);
    monoFilm.reset ();
    
    monoFilm.add_marks ();

    monoFilm.add_jobInfo (job);

    //monoFilm.add_spotInfo_numbered ();

    monoFilm.add_spotInfo_numbered ();
    
    monoFilm.position_textFrames();
    
    monoFilm.resize_page();

    monoFilm.save (job, true, false);



}
main();