#targetengine "session"

// automatic switch workspace between ansicht and film    
(function () {
    var myEventFunction = function (myEvent) {   
        if (myEvent.parent.constructor.name == 'LayoutWindow' ) {           
            if(app.activeDocument.name.indexOf('Ansicht') > -1) {
                app.applyWorkspace('monoAnsicht');
            } else if (app.activeDocument.name.indexOf('Film') > -1) {
                app.applyWorkspace('monoFilms');
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
})();

/* 
alert('hello mono from indesign'); 
*/