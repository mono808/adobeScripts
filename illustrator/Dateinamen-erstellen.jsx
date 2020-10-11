//@target illustrator
$.level = 1;

function main() {

    //@include 'require.jsx'

    var f_all = require('f_all');
    var paths = require('paths');
    var saveOptions = require('saveOptions');
    var job = require('job');

    job.set_nfo(null, true, false);

    f_all.saveFile (paths.file('workingAi', job.nfo), saveOptions.ai_sep(), false);
};

if (app.documents.length > 0) {
    main();
} else {
    alert('No open Document!');
}