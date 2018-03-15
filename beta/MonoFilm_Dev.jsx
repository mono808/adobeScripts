﻿#target indesign
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


    for (var i = 0; i < app.documents.length; i++) {
        app.documents[i].close(SaveOptions.NO);
    }

    var graphicFile = new File('/c/capri-stuff/Kundendaten/B2B/Criminals/0546A17-014_Mausi-Shirts/Druckdaten-SD/Front_220x245_SD_Print.ai');
    
    var monoFilm = new MonoFilm();

    monoFilm.create_template (false);

    monoFilm.place_sep (graphicFile);

    var job = new Job(null, false);
    var pm = new Pathmaker(job.nfo);

    monoFilm.add_marks ();

    monoFilm.add_jobInfo (job);

    //monoFilm.add_spotInfo_numbered ();

    monoFilm.add_spotInfo2 ();
    
    monoFilm.position_textFrames();

    monoFilm.save (job, true, false);

    monoFilm.print ();

    var spotNames = monoFilm.get_spotNames ();

    var spots = monoFilm.get_all_spotColors ();

    var sepPos = monoFilm.get_sepPos ();
    var sepWidth = monoFilm.get_sepWidth ();
    monoFilm.close ();

    var myFile = monoFilm.filmFile;

    //monoFilm.reset ();

    var monoFilm = {};
    monoFilm = new MonoFilm(myFile);
    
    spotNames = monoFilm.get_spotNames ();

    spots = monoFilm.get_all_spotColors ();

    sepPos = monoFilm.get_sepPos ();
    sepWidth = monoFilm.get_sepWidth ();
    monoFilm.close ();

}
main();