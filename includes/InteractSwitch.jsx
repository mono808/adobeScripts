function InteractSwitch () {
    this.oldSetting = {};
};

InteractSwitch.prototype.set = function(what2Show) {            
    switch (app.name) {
        case 'Adobe Illustrator' :
            this.oldSetting.ai = app.userInteractionLevel;
            switch (what2Show) {
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
            this.oldSetting.indd = app.scriptPreferences.userInteractionLevel;
            switch (what2Show) {
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
            this.oldSetting.ps = app.displayDialogs;
            switch(what2Show) {
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

InteractSwitch.prototype.reset = function() {
    switch (app.name) {
        case 'Adobe Illustrator' :
            app.userInteractionLevel = this.oldSetting.ai;
        break;                
        case 'Adobe InDesign' :
            app.scriptPreferences.userInteractionLevel = this.oldSetting.indd;
        break;
        case 'Adobe Photoshop' :
            app.displayDialogs = this.oldSetting.ps;
        break;
    }
};
