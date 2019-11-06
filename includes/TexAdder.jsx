﻿function find_files (dir)
    {
    return find_files_sub (dir, []);
    }

function find_files_sub (dir, array)
    {
    var f = Folder (dir).getFiles ("*.*");
    for (var i = 0; i < f.length; i++)
        {
        if (f[i] instanceof Folder)
            find_files_sub (f[i], array);
        else
            if (f[i] instanceof File)
                array.push (f[i]);
        }
    return array;
    }

function TexAdder (doc) {
    var csroot = $.getenv("csroot");
    var texRoot = new Folder(csroot + "/Produktion/Druckvorstufe/textilien");
    var doc;
    //var fixedLayers = /(Shirt|Front|Back|Naht|Tasche|Beutel)$/i;
    var fixedLayers = /(Shirt|Naht|Tasche|Beutel|Hintergrund)$/i;
        
    return {
        add_tex : function (targetDoc) {
            doc = targetDoc ? targetDoc : app.activeDocument;
            var texFolders = [];
            /*
            var allTexs = [];
            texFolders = this.get_tex_folder();
            for (var i = 0; i < texFolders.length; i++) {
                var tempTex = this.get_tex_files(texFolders[i]);
                allTexs = allTexs.concat(tempTex);
            } 
            */
            var allTexs = this.get_tex_files(texRoot);
            var selectedTex = this.show_type_ahead(allTexs, 'displayName');
            var images = this.place_files_on_page(selectedTex);
            this.choose_graphicLayers(images);            
        },

        set_tex: function (selection) {
            var images = [];
            for (var i=0, len=selection.length; i < len ; i++) {
              var pI = selection[i];
              if(pI.constructor.name == 'Rectangle' && pI.graphics.length > 0) {
                  images.push(pI.graphics[0]);
              }
            };
            this.choose_graphicLayers(images);
        },
    
        get_tex_folder : function () {
            var texFolders = texRoot.getFiles (function (a) {return a instanceof Folder});
            var selectedFolders = this.show_type_ahead(texFolders, 'displayName');
            return selectedFolders;
        },
    
        get_tex_files_bkp : function (fld) {
            var texFiles = fld.getFiles (function (a) {return a instanceof File});
            return texFiles;
        },

        get_tex_files : function (dir) {
            var texFiles = find_files (dir);
            return texFiles;
        },        

        create_names_array : function (array, propertyToList) {            
            var names = [];
            for(var i = 0; i < array.length; i++) {
                names.push(array[i][propertyToList]);
            }
            return names;
        },
    
        get_member : function (haystack, needle, propertyToCheck) {
            for (var i = 0; i < haystack.length; i++) {
                var val = propertyToCheck ? haystack[i][propertyToCheck] : haystack[i];                   
                if( val == needle) {
                    return haystack[i];
                }
            }
            return null;
        },

        place_files_on_page : function (myFiles) {
            var images = [];
            var texLayer = doc.layers.item('Textils');
            texLayer = texLayer.isValid ? texLayer : doc.activeLayer;
            for (var i = 0; i < myFiles.length; i++) {
                var retval = doc.layoutWindows[0].activePage.place(myFiles[i], undefined, texLayer);
                if(retval && retval.length > 0) images.push(retval[0]);
            }
            return images;
        },

        choose_graphicLayers : function (myImages)
        {            
            for (var i = 0; i < myImages.length; i++) {
                var myImage = myImages[i];
                
                // filter out graphic files unsuitable for activating graphic layers
                if (myImage.imageTypeName != "Photoshop" && myImage.imageTypeName != "Adobe PDF") continue;

                // get ref to the parent object, otherwise the script will fuckup ...
                var rect = myImage.parent;
                var gLO = rect.graphics.item(0).graphicLayerOptions;

                if (gLO.graphicLayers < 2) continue;

                var layerNames = [];
                for (var j = 0; j < gLO.graphicLayers.length; j++) {
                        
                    if(!gLO.graphicLayers.item(j).name.match(fixedLayers)) { 
                        layerNames.push(gLO.graphicLayers.item(j).name);
                    }
                    //layerNames.push(gLO.graphicLayers.item(j).name);
                    //$.writeln('j-gL ' + j + ': '  + gLO.graphicLayers.item(j).name + ' myImage ID: ' + myImage.id);
                }

                var selectedLayerNames = this.show_type_ahead(layerNames);
                
                for(var k = 0, maxK = gLO.graphicLayers.length; k < maxK; k += 1) {
                    var gLO = rect.graphics.item(0).graphicLayerOptions;
                    var gL = gLO.graphicLayers.item(k);
                                       
                    if(!gL.isValid) continue;
                    if(this.get_member(selectedLayerNames, gL.name)) {
                        gL.currentVisibility = true;
                    } else {
                        if(!gL.name.match(fixedLayers))
                            gL.currentVisibility = false;
                    }
                }
            }
        },

        is_adjustable_graphicLayer : function (layer) {

            if(!layer.name.match(fixedLayers) && !layer.locked) {
                return true;
            } else {
                return false;
            }
        },

        filter_graphicLayers_BKP : function (layer) {
            var filteredLayers = [];
            for (var i = 0; i < gLayers.length; i++) {
                if(!gLayers[i].name.match(fixedLayers) && !gLayers[i].locked) {
                    filteredLayers.push(gLayers[i]);
                }
            }
            return filteredLayers.sort();
        },
    
        show_type_ahead : function (array, propertyToList) {
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
            var list = dummy.add ('listbox', [0,0,250,500], names, {multiselect: true});
            entry.onChanging = function ()
            {
                keyCount++;
                if(keyCount < 4) return;
                var temp = String(entry.text).toLowerCase();
                var tempArray = [];
                for (var i = 0; i < names.length; i++) {
                    if (names[i].toLowerCase().indexOf(temp) > -1) {
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

/*             entry.onChange = function ()
            {
                var temp = entry.text;
                var tempArray = [];
                for (var i = 0; i < names.length; i++) {
                    if (names[i].toLowerCase().indexOf(temp) >= 0) {
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
            } // entry.onChanging    */   

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
    };
}