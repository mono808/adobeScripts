function TexAdder () {
    var csroot = $.getenv("csroot");
    var texRoot = new Folder(csroot + "/Produktion/Druckvorstufe/textilien");
        
    return {
        add_tex : function () {
            var texFolders = [];
            var allTexs = [];
            texFolders = this.get_tex_folder();
            for (var i = 0; i < texFolders.length; i++) {
                var tempTex = this.get_tex_files(texFolders[i]);
                allTexs = allTexs.concat(tempTex);
            }
            var selectedTex = this.show_type_ahead(allTexs);
            
        },
    
        get_tex_folder : function () {
            var texFolders = texRoot.getFiles (function (a) {return a instanceof Folder});
            var selectedFolders = this.show_type_ahead(texFolders);
            return selectedFolders;
        },
    
        get_tex_files : function (fld) {
            var texFiles = fld.getFiles (function (a) {return a instanceof File});
            return texFiles;
        },

        create_names_array : function (array) {            
            var names = [];
            for(var i = 0; i < array.length; i++) {
                names.push(array[i].displayName);
            }
            return names;
        },
    
        get_member : function (haystack, needle) {
            for (var i = 0; i < haystack.length; i++) {
                if(haystack[i].displayName == needle) {
                    return haystack[i];
                }
            }
        },

        show_type_ahead : function (array) {
            var names = this.create_names_array(array);
            var selected = [];
            var temp;
            var w = new Window ('dialog {text: "Quick select", alignChildren: "fill"}');
            var entry = w.add ('edittext {active: true}');
            var dummy = w.add ('panel {alignChildren: "fill"}');
            var list = dummy.add ('listbox', [0,0,250,250], names, {multiselect: true});
            entry.onChanging = function ()
            {
                var temp = entry.text;
                var tempArray = [];
                for (var i = 0; i < names.length; i++) {
                    if (names[i].toLowerCase().indexOf (temp) == 0) {
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
                var returnArray = [];
                for (var i = 0; i < selected.length; i++) {
                    returnArray.push(this.get_member(array, selected[i]));
                }
                return returnArray;
            }

            w.close();
        }
    };
}

function main () {
    var texAdder = new TexAdder();
    texAdder.add_tex();
    
}
main();