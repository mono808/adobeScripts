function create_names_array (array, propertyToList) {            
    var names = [];
    for(var i = 0; i < array.length; i++) {
        names.push(array[i][propertyToList]);
    }
    return names;
}

function get_member (haystack, needle, propertyToCheck) {
    for (var i = 0; i < haystack.length; i++) {
        var val = propertyToCheck ? haystack[i][propertyToCheck] : haystack[i];                   
        if( val == needle) {
            return haystack[i];
        }
    }
    return null;
}

function show_dialog (array, propertyToList, dialogTitle, infoText) {

    var dialogTitle = dialogTitle || 'Button List';
    var infoText = infoText || 'Please choose:';

    if(propertyToList) {
        var names = create_names_array(array, propertyToList);
    } else {
        var names = array;
    }
    
    var selected;
    var w = new Window ('dialog', dialogTitle);
    w.alignChildren = "fill";
    w.add('statictext', undefined, infoText, {multiline: true});

    var pnl = w.add('panel');
    for (var i = 0; i < names.length; i++) {
        var btn = pnl.add("button",[25, 25, 250, 45], names[i]);
        btn.onClick = function () {
            selected = this.text;
            w.close();
        }
    }

    if (w.show () != 2){
        if(!selected) return null;

        if(propertyToList) {
            return(get_member(array, selected, propertyToList));
        }

        return selected;
    }
    
    w.close();
}    

exports.show_dialog = show_dialog;