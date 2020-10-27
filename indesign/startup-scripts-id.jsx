#target indesign
#targetengine "session"

// automatic switch workspace between ansicht and film    
(function () {
    var myEventFunction = function (myEvent) {   
        if (myEvent.parent.constructor.name == 'LayoutWindow' ) {           
            if(app.activeDocument.name.indexOf('Ansicht') > -1) {
		try {
                    app.applyWorkspace('Ansichten');
		} catch(e) {
		    $.writeln('could not load workspace "Ansichten"');
		}
            } else if (app.activeDocument.name.indexOf('Film') > -1) {
		try {
                    app.applyWorkspace('Filme');
		} catch(e) {
		    $.writeln('could not load workspace "Filme"');
		}
            }
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

   app.addEventListener("afterActivate", myEventFunction, false);
    app.addEventListener("afterSave",myEventFunction,false);
})();

/* 
alert('hello mono from indesign'); 
*/
