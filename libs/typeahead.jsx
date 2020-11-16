function arrayify (inputElements) {
    var arr = [];
    for (var i=0, len=inputElements.length; i < len ; i++) {
        arr.push(inputElements[i]);
    };
    return arr;
}

exports.show_dialog = function (inputElements, propertyToList, multiselect, dialogTitle) {
    
    var names;
    if(propertyToList) {
        if(inputElements.constructor.name != 'Array') 
            inputElements = arrayify(inputElements);

        names = inputElements.map(function(elem) {return elem[propertyToList]});

    } else {
        names = inputElements;
    }


    var temp;
    var keyCount = 0;

    var w = new Window ('dialog {alignChildren: "fill"}');
    w.text = dialogTitle || 'Quick select';

    var entry = w.add ('edittext {active: true}');
    var dummy = w.add ('panel {alignChildren: "fill"}');
    var list = dummy.add ('listbox', [0,0,250,250], names, {multiselect: multiselect});
    w.add ('button {text: "Ok"}');

    entry.onChanging = function ()
    {
        keyCount++;
        if(keyCount < 4 || entry.text.length < 4) return;
        var tempRegExp = new RegExp(entry.text,'gi');
        var tempArray = [];
        for (var i = 0; i < names.length; i++) {
            if (names[i].match(tempRegExp)) {
                tempArray.push (names[i]);
            }
            if (tempArray.length > 0) {
                // Create the new list with the same bounds as the one it will replace
                tempList = dummy.add ("listbox", list.bounds, tempArray, {scrolling: true, multiselect: multiselect});
                dummy.remove(list);
                list = tempList;
                list.selection = 0;
            }
        }
    }

    if (w.show () == 2){ 
        w.close();
        return null;
    }

    if(!list.selection) {
        w.close();
        return [];
    }

    if(list.selection instanceof Array) {
        var selectedStrings = list.selection.map(function(elem) {
            return elem.text;
        });

    } else {
        var selectedStrings = [list.selection.text];
    }

    if(!propertyToList) return selectedStrings;

    // if not simply returning the selected strings, get the corresponding inputElements with a matching value in the specified key
    var selectedObjects = selectedStrings.map(function(str) {
        return inputElements.find(function (elem) {
            return (elem[propertyToList] === str);
        });
    });

    return selectedObjects;

    w.close();
}

//show_dialog ([1,2,3,4]);
