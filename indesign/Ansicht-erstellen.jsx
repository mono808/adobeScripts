﻿//@target indesign
//@include 'require.jsx'

(function () {

    var f_all = require('f_all');

    var job = require('job');
    var jobFolder = require('jobFolder');
    var paths = require('paths');
    var names = require('names');

    var MonoMockup = require('MonoMockup');
    var MonoPrint = require('MonoPrint');
    var saveOptions = require('saveOptions');

    job.set_nfo(null,false);
    if(!job.nfo) return;
    paths.set_nfo(job.nfo);

    try{
        app.applyWorkspace('Ansichten');
    } catch(e) {
        $.writeln('could not load workspace "Ansichten"');
    }

    var mockup = new MonoMockup();

    mockup.create_mockupDoc();
    mockup.init();

    mockup.import_empty_template();
    //mockup.import_pages();

    mockup.save_doc(paths.file('mockUpIndd'));

    mockup.show_shop_logo(job.nfo.shop);
    mockup.fill_job_infos(job.nfo);

    jobFolder.set_folder(job.nfo.folder);
    var monoPrints = jobFolder.get_prints();

    mockup.place_prints_on_page (monoPrints);

    mockup.add_preview_page();

})();