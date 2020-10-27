//@target indesign
//@include 'require.jsx'

(function() {
    
    var MonoMockup = require('MonoMockup');

    //var job = new Job(null,false);
    //var pm = new Pathmaker(job.nfo);
    //var typeahead = new Typeahead();
    var mockup = new MonoMockup(app.activeDocument);
    mockup.add_hinweis();
})();