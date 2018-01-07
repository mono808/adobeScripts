function ButtonList (title, text) {
    this.title = title || 'monos ButtonList';
    this.text = text || 'Please choose one of the options:';
    this.create_names_array = function (array, propertyToList) {            
        var names = [];
        for(var i = 0; i < array.length; i++) {
            names.push(array[i][propertyToList]);
        }
        return names;
    },

    this.get_member = function (haystack, needle, propertyToCheck) {
        for (var i = 0; i < haystack.length; i++) {
            var val = propertyToCheck ? haystack[i][propertyToCheck] : haystack[i];                   
            if( val == needle) {
                return haystack[i];
            }
        }
        return null;
    },

    this.show_dialog = function (array, propertyToList) {
        if(propertyToList) {
            var names = this.create_names_array(array, propertyToList);
        } else {
            var names = array;
        }
        
        var selected;
        var w = new Window ('dialog', this.title);
        w.alignChildren = "fill";
        w.add('statictext', undefined, this.text, {multiline: true});

        var pnl = w.add('panel');
        for (var i = 0; i < names.length; i++) {
            var btn = pnl.add("button",[25, 25, 250, 45], names[i]);
            btn.onClick = function () {
                selected = this.text;
                w.close();
            }
        }

        if (w.show () != 2){
            if(selected) {
                if(!propertyToList) return selected;
                else {
                    return(this.get_member(array, selected, propertyToList));
                }
            }
        }
        
        w.close();
    }    
}