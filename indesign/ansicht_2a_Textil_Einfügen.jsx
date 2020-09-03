function add_textiles () {

    var find_files = function  (dir, filter) {
        return find_files_sub (dir, [], filter);
    }

    var find_files_sub = function  (dir, array, filter) {
        var f = Folder (dir).getFiles ("*.*");
        for (var i = 0; i < f.length; i++)
            {
            if (f[i] instanceof Folder)
                find_files_sub (f[i], array, filter);
            else
                if (f[i] instanceof File && f[i].displayName.search(filter) == -1)
                    array.push (f[i]);
            }
        return array;
    }

    var get_tex_folder = function () {
        var texFolders = texRoot.getFiles (function (a) {return a instanceof Folder});
        var selectedFolders = show_type_ahead(texFolders, 'displayName');
        return selectedFolders;
    };

    var get_tex_files = function (dir, filter) {
        var texFiles = find_files (dir, filter);
        return texFiles;
    };

    var create_names_array = function (array, propertyToList) {            
        var names = [];
        for(var i = 0; i < array.length; i++) {
            names.push(array[i][propertyToList]);
        }
        return names;
    };

    var get_member = function (haystack, needle, propertyToCheck) {
        for (var i = 0; i < haystack.length; i++) {
            var val = propertyToCheck ? haystack[i][propertyToCheck] : haystack[i];                   
            if( val == needle) {
                return haystack[i];
            }
        }
        return null;
    };

    var show_type_ahead = function (array, propertyToList, multiselect) {
        if(propertyToList) {
            var names = create_names_array(array, propertyToList);
        } else {
            var names = array;
        }
        var selected = [];
        var temp;
        var keyCount = 0;
        var w = new Window ('dialog {text: "Quick select", alignChildren: "fill"}');
        var entry = w.add ('edittext {active: true}');
        var dummy = w.add ('panel {alignChildren: "fill"}');
        var list = dummy.add ('listbox', [0,0,250,500], names, {multiselect: multiselect});
        entry.onChanging = function ()
        {
            keyCount++;
            if(keyCount < 4 || entry.text.length < 4) return;
            var temp = String(entry.text).toLowerCase();
            var tempArray = [];
            for (var i = 0; i < names.length; i++) {
                if (names[i].toLowerCase().indexOf(temp) > -1) {
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
                returnArray.push(get_member(array, selected[i], propertyToList));
            }
            return returnArray;
        }
        w.close();
    }

    var place_image = function (parent, image, layer) {
        var placedItemsArray = parent.place(image, undefined, layer);
        if(placedItemsArray) {
            finalSelection.push(placedItemsArray[0].parent);
        }
    }

    var csroot = $.getenv("csroot");
    var texRoot = new Folder(csroot + "/Produktion/Druckvorstufe/textilien");
    var doc = app.activeDocument;

    var placeToLayer = doc.layers.item('Textils');
    placeToLayer = placeToLayer.isValid ? placeToLayer : doc.activeLayer;

    var finalSelection = [];

    var ignoreThoseFiles = /\.bridge/i;
    var allTexs = get_tex_files(texRoot, ignoreThoseFiles);
    allTexs.sort(function(a,b) {
        return a.displayName.toLowerCase() > b.displayName.toLowerCase();
    })

    // if something is selected,  place image into selected rectangles
    if(app.selection.length > 0) {
        for (var i=0, len=app.selection.length; i < len ; i++) {
            var selItem = app.selection[i];
            if(selItem.constructor.name === 'Rectangle') {
                var selectedTex = show_type_ahead(allTexs, 'displayName', false);
                if(selectedTex) {
                    var fitOps = selItem.frameFittingOptions;
                    fitOps.fittingAlignment = AnchorPoint.TOP_CENTER_ANCHOR;
                    fitOps.fittingOnEmptyFrame = EmptyFrameFittingOptions.NONE;
                    fitOps.autoFit = false;
                    selItem.fit(FitOptions.APPLY_FRAME_FITTING_OPTIONS);

                    place_image(selItem, selectedTex[0]);
                    selItem.fit(FitOptions.CENTER_CONTENT);
                    selItem.fit(FitOptions.FRAME_TO_CONTENT);
                }
            }
        }
    // if nothing is selected, just place selected images onto the page
    } else {
        var selectedTex = show_type_ahead(allTexs, 'displayName', true);
        if(selectedTex) {
            for (var i = 0; i < selectedTex.length; i++) {
                place_image(doc.layoutWindows[0].activePage, selectedTex[i], placeToLayer);
            }
        }
    }
    if(finalSelection && finalSelection.length > 0) {
        app.selection = finalSelection;
    }
}

add_textiles();