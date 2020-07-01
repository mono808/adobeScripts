function choose_object_layers (selection) {

    var create_names_array = function (array, propertyToList) {            
        var names = [];
        for(var i = 0; i < array.length; i++) {
            names.push(array[i][propertyToList]);
        }
        return names;
    };

    var get_graphicLayerNames = function (myImage) {
        // get ref to the parent object, otherwise the script will fuckup ...
        var graphicLayers = myImage.graphicLayerOptions.graphicLayers;
        var graphicLayerNames = [];
        var gL;

        if (graphicLayers.length < 2) return graphicLayerNames;

        outer_loop:
        for (var j=0, lenJ=graphicLayers.length; j < lenJ ; j++) {
            gL = graphicLayers[j];
            for (var k=0, lenK=fixedLayerNames.length; k < lenK ; k++) {
                if(fixedLayerNames[k] === gL.name) continue outer_loop;
            };
            graphicLayerNames.push(graphicLayers.item(j).name);
        };

        return graphicLayerNames;
    };

    var toggle_graphicLayers = function (myImage, visibleLayerNames) {

        var rect = myImage.parent;
        var gLO = rect.graphics.item(0).graphicLayerOptions;
        var gL;
        
        deactivate_block: 
        for (var k=0, lenK = gLO.graphicLayers.length; k < lenK ; k++) {
            gL = gLO.graphicLayers[k];
            if(gL.isValid) {
                if(gL.currentVisibility) {
                    gL.currentVisibility = false;
                    gLO = rect.graphics.item(0).graphicLayerOptions;
                }
            }
        }
        
        activate_block: 
        for (var k=0, lenK = gLO.graphicLayers.length; k < lenK ; k++) {
            gL = gLO.graphicLayers[k];
            if(gL.isValid) {
                for (var i=0, lenI=visibleLayerNames.length; i < lenI ; i++) {
                    if(visibleLayerNames[i] === gL.name) {
                        gL.currentVisibility = true;
                        gLO = rect.graphics.item(0).graphicLayerOptions;
                        continue activate_block;
                    }
                }
            }
        }
    };

    var is_adjustable_graphicLayer = function (layer) {

        if(!layer.name.match(fixedLayers) && !layer.locked) {
            return true;
        } else {
            return false;
        }
    };

    var show_type_ahead = function (namesArray) {

        var selected = [];
        var temp;
        var keyCount = 0;
        var w = new Window ('dialog {text: "Quick select", alignChildren: "fill"}');
        var entry = w.add ('edittext {active: true}');
        var dummy = w.add ('panel {alignChildren: "fill"}');
        var list = dummy.add ('listbox', [0,0,250,500], namesArray, {multiselect: true});
        entry.onChanging = function ()
        {
            keyCount++;
            if(keyCount < 4) return;
            var temp = String(entry.text).toLowerCase();
            var tempArray = [];
            for (var i = 0; i < namesArray.length; i++) {
                if (namesArray[i].toLowerCase().indexOf(temp) > -1) {
                    tempArray.push (namesArray[i]);
                  }
                if (tempArray.length > 0) {
                    // Create the new list with the same bounds as the one it will replace
                    tempList = dummy.add ("listbox", list.bounds, tempArray, {scrolling: true});
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
            return selected;
        }
        w.close();
    };

    // names of layers that should always be visible
    var fixedLayerNames = ["Shirt","Naht","Tasche","Beutel","Hintergrund"];

    var images = [];
    for (var i=0, len=selection.length; i < len ; i++) {
        var pI = selection[i];
        if(pI.constructor.name === 'Rectangle' && pI.graphics.length > 0) {
            images.push(pI.graphics[0]);
        }
    };

    for (var i = 0; i < images.length; i++) {
        var myImage = images[i];

        if (myImage.imageTypeName !== "Photoshop" && myImage.imageTypeName !== "Adobe PDF") continue;
        
        var graphicLayerNames = get_graphicLayerNames(myImage);
        
        var selectedLayerNames = show_type_ahead(graphicLayerNames);

        var visibleLayerNames = selectedLayerNames ? selectedLayerNames.concat(fixedLayerNames) : fixedLayerNames;
        if(visibleLayerNames && visibleLayerNames.length > 0) {
            toggle_graphicLayers(myImage, visibleLayerNames);
        }
    }
}

choose_object_layers(app.selection);