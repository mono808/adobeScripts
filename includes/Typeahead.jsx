function Typeahead () {
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
        var selected = [];
        var temp;
        var keyCount = 0;
        var w = new Window ('dialog {text: "Quick select", alignChildren: "fill"}');
        var entry = w.add ('edittext {active: true}');
        var dummy = w.add ('panel {alignChildren: "fill"}');
        var list = dummy.add ('listbox', [0,0,250,250], names, {multiselect: true});
        entry.onChanging = function ()
        {
            keyCount++;
            if(keyCount < 3) return;
            var temp = entry.text;
            var tempArray = [];
            for (var i = 0; i < names.length; i++) {
                if (names[i].toLowerCase().indexOf(temp) == 0) {
                    tempArray.push (names[i]);
                 }
                if (tempArray.length > 0) {
                    // Create the new list with the same bounds as the one it will replace
                    tempList = dummy.add ("listbox", list.bounds, tempArray, {scrolling: true});
                    dummy.remove(list);
                    list = tempList;
                    list.selection = 0;
                }
            }
        } // entry.onChanging
        w.add ('button {text: "Ok"}');

        if (w.show () != 2){
            if(list.selection) {
                if(list.selection instanceof Array) {
                    for (var i = 0; i < list.selection.length; i++) {
                        selected.push(list.selection[i].text);
                    }
                } else {
                    selected.push(list.selection.text);
                }
            }
            if(!propertyToList) return selected;

            // if not simply returning the selected text, get the corresponding object
            var returnArray = [];               
            for (var i = 0; i < selected.length; i++) {
                returnArray.push(this.get_member(array, selected[i], propertyToList));
            }
            return returnArray;
        }
        w.close();
    }    
}
