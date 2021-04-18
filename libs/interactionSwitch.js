var oldIALevel;

exports.set = function (iALevel) {            
    switch (app.name) {
        case 'Adobe Illustrator' :
            oldIALevel = app.userInteractionLevel;
            switch (iALevel) {
                case 'none' :
                    app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
                break;                        
                case 'error' :
                case 'all' :
                    app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
                break;
            }
        break;
        
        case 'Adobe InDesign' :
            oldIALevel = app.scriptPreferences.userInteractionLevel;
            switch (iALevel) {
                case 'none' :
                    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
                break;                        
                case 'error' :
                    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;
                break;
                case 'all' :
                    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
                break;
            }
        break;

        case 'Adobe Photoshop' :
            oldIALevel = app.displayDialogs;
            switch(iALevel) {
                case 'none' :
                    app.displayDialogs = DialogModes.NO;
                break;                        
                case 'error' :
                    app.displayDialogs = DialogModes.ERROR;
                break;
                case 'all' :
                    app.displayDialogs = DialogModes.ALL;
                break;                        
            }
        break;
    }
};

exports.reset = function() {
    switch (app.name) {
        case 'Adobe Illustrator' :
            app.userInteractionLevel = oldIALevel;
        break;                
        case 'Adobe InDesign' :
            app.scriptPreferences.userInteractionLevel = oldIALevel;
        break;
        case 'Adobe Photoshop' :
            app.displayDialogs = oldIALevel;
        break;
    }
};
