//@target indesign
//@include 'require.jsx'

(function () {

    var f_all = require('f_all');
    
    var job = require('job');
    var jobFolder = require('jobFolder');
    var paths = require('paths');
    var names = require('names');
    
    var MonoMockup = require('MonoMockup');
    var MonoTable = require('MonoTable');
    var saveOptions = require('saveOptions');

    job.set_nfo(null,false);
    if(!job.nfo) return;
    paths.set_nfo(job.nfo);
    
    var monoMockup = new MonoMockup();
    monoMockup.init(app.activeDocument);
    
    var myPage = app.activeWindow.activePage;
    var monoGraphics = monoMockup.get_monoGraphics(myPage, monoMockup.layers.prints);
    
	var monoTable = new MonoTable(myPage);
	monoTable.create_table(myPage, true);

    for(var i = 0; i < monoGraphics.length; i++) {
        monoTable.add_row(monoGraphics[i]);
    }
})();