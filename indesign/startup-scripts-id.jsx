//@target indesign
//@targetengine "session"
//@include 'require.jsx'


(function () {

//~     function loadWorkspace (myEvent) {   
//~         if (myEvent.parent.constructor.name !== 'LayoutWindow' ) return;

//~         if(app.activeDocument.name.indexOf('Ansicht') > -1) {
//~             try {
//~                 app.applyWorkspace('Ansichten');
//~             } catch(e) {
//~                 $.writeln('could not load workspace "Ansichten"');
//~             }
//~         } else if (app.activeDocument.name.indexOf('Film') > -1) {
//~             try {
//~                 app.applyWorkspace('Filme');
//~             } catch(e) {
//~                 $.writeln('could not load workspace "Filme"');
//~             }
//~         }
//~     }

    function addToRecentFiles (myEvent) {
        //$.writeln('event parent is ' + myEvent.parent.constructor.name);
        try {
            var doc = myEvent.parent.parent.fullName;
            var recentFiles = require('recentFiles');
            recentFiles.add_file(myEvent.parent.parent.fullName);
        } catch (e) {
            $.writeln(e.msg);
        }
    }

    for (var i = 0; i < app.eventListeners.length; i++) {
        var listener = app.eventListeners[i];
        if(listener.eventType == "afterActivate") {
            listener.remove();
        }
    }

    for (var i = 0; i < app.eventListeners.length; i++) {
        var listener = app.eventListeners[i];
        if(listener.eventType == "afterOpen") {
            listener.remove();
        }
    }

//~     app.addEventListener("afterActivate", loadWorkspace, false);
//~     app.addEventListener("afterSave",loadWorkspace,false);

    app.addEventListener("afterActivate", addToRecentFiles, false);
    app.addEventListener("afterSave",addToRecentFiles,false);
})();

/* 
alert('hello mono from indesign'); 
*/
