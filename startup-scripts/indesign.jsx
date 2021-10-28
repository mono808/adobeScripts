// alert("hello from indesign");

//@target indesign
//@targetengine "session"
//@include "require.js"

//~ (function () {
//~     function addToRecentFiles(myEvent) {
//~         try {
//~             var currentFile = myEvent.parent.parent.fullName;
//~             var recentFiles = require("recentFiles");
//~             recentFiles.add_file(currentFile);
//~         } catch (e) {
//~             $.writeln(e.msg);
//~         }
//~     }

//~     var i, listener;
//~     for (i = 0; i < app.eventListeners.length; i++) {
//~         listener = app.eventListeners[i];
//~         if (listener.eventType == "afterActivate") {
//~             listener.remove();
//~         }
//~     }

//~     for (i = 0; i < app.eventListeners.length; i++) {
//~         listener = app.eventListeners[i];
//~         if (listener.eventType == "afterOpen") {
//~             listener.remove();
//~         }
//~     }

//~     app.addEventListener("afterActivate", addToRecentFiles, false);
//~     app.addEventListener("afterSave", addToRecentFiles, false);
//~ })();
