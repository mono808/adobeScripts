function MonoGraphic (myGraphic)
{
    var check_folder = function (fldr) {
        var jobFolder;
        if (fldr.displayName.match(reJobNr)) {
            jobFolder = fldr;
        } else {
            jobFolder = check_folder(fldr.parent)
        }
        return jobFolder;
    };

    var get_midPoint = function (item) {
        var gB = item.geometricBounds;
        var xCenter = gB[3]-gB[1];
        var yCenter = gB[2]-gB[0];
        return [xCenter,yCenter];
    };

    var check_if_geoBounds1_within_geoBounds2 = function (gB1, gB2) {
        var y1,x1,y2,x2,
            retval = true;
        y1 = (gB1[0] > gB2[0]);
        x1 = (gB1[1] > gB2[1]);
        y2 = (gB1[2] < gB2[2]);
        x2 = (gB1[3] < gB2[3]);
        return (y1 && x1 && y2 && x2);
    };
    var reJobNr = /\d{1,5}(wme|wm|ang|cs|a)\d\d-0\d\d/i;
    var ref = myGraphic;
    var doc = myGraphic.parentPage.parent.parent;
    var docScale =doc.documentPreferences.pageWidth/ 297;
    var page = ref.parentPage;
    var fileName = myGraphic.properties.itemLink.name;
    var filePath = myGraphic.properties.itemLink.filePath;
    var myFile = File(filePath);
    var myFolder = myFile.parent;
    var jobFolder;
    var monoPrint;

    var divider = doc.guides.item('sideDivider');
    var side = myGraphic.geometricBounds[3] < divider.location ? 'Front' : 'Back';

    
    /* Public API
    ----------------------------------------------------*/
    return {
        get_displacement : function () {
            
            var xFront, xBack, x;

            xFront = page.guides.item('midlineFront').location;
            xBack = page.guides.item('midlineBack').location;

            if (side === 'Front') {
                x = xFront;
            } else if (side === 'Back') {
                x = xBack;
            }
            var geoBounds = ref.geometricBounds;
            var displacement = geoBounds[1] > x ? geoBounds[1] - x : geoBounds[1] - x;

            return displacement;
        },

        get_textil : function () {
            var layer = doc.layers.item('Textils');

            for (var i = 0; i < layer.allGraphics.length; i++) {
                var textil = layer.allGraphics[i];
                var link = textil.itemLink ? textil.itemLink : textil;
                if (link && textil.parentPage === page) {
                    if(check_if_geoBounds1_within_geoBounds2(ref.geometricBounds, textil.geometricBounds)) {
                        return link;
                    }
                }
            }
            return null;
        },

        get_printId : function () {
            if(!jobFolder) jobFolder = check_folder(myFolder);
            if(!monoPrint) monoPrint = new MonoPrint(myFile, jobFolder);
            return monoPrint.id ? monoPrint.id : '...';
        },

        get_tech : function () {
            if(!jobFolder) jobFolder = check_folder(myFolder);
            if(!monoPrint) monoPrint = new MonoPrint(myFile, jobFolder);
            return monoPrint.tech ? monoPrint.tech : '...';
        },

        get_textil_color : function () {
            var textil = this.get_textil();
            if(textil instanceof Link){textil = textil.parent;}
            var monoTextil = new MonoTextil();
            return monoTextil.get_active_layer(textil);
        },
            
        get_textil_name : function () {
            var textil = this.get_textil();
            if(textil && textil.name) {
                var fname = textil.name
                return fname.substring(0, fname.lastIndexOf('.'));
            } else {
                return 'n Shirt';
            }
        },

        get_width : function () {
            return ref.geometricBounds[3] - ref.geometricBounds[1];
        },

        get_height : function () {
            return ref.geometricBounds[2] - ref.geometricBounds[0];
        },
    
        get_file : function (fileType) {
            if(!jobFolder) jobFolder = check_folder(myFolder);
            if(!monoPrint) monoPrint = new MonoPrint(myFile, jobFolder);
            if(monoPrint.hasOwnProperty(fileType) && monoPrint[fileType] && monoPrint[fileType] instanceof File) {
                return monoPrint[fileType]
            } else {
                return null;
            }
        },

        get_stand : function () {
            
            var adjust_for_shirts = function (virtDist) {                
                // 1,1 (bei Shirts Faktor für die Krümmung der Brust 
                // Schulterblätter innerhalb der ersten 11 cm ab Kragen)
                if(virtDist > 110) {
                    var bowedDist = 110*1.1;
                    var straigtDist = virtDist-110;
                    return bowedDist+straigtDist;
                } else {
                    return virtDist*1.1;
                }
            };

            try {
                var yFront = ref.parentPage.graphicLines.item('necklineFront').geometricBounds[0];
                var yBack = ref.parentPage.graphicLines.item('necklineBack').geometricBounds[0];
            } catch(e) {
                var yFront = ref.parentPage.guides.item('necklineFront').location;
                var yBack = ref.parentPage.guides.item('necklineBack').location;
            }

            if(side === 'Front') {
                var y = yFront;
            } else if (side === 'Back') {
                var y = yBack;
            }
            
            var virtualStand = ref.geometricBounds[0] - y;
            if(virtualStand > 0 && docScale == 6.5) {
                return adjust_for_shirts(virtualStand);
            } else {
                return virtualStand;
            }
        },

        get_colors : function () {
            if(!jobFolder) jobFolder = check_folder(myFolder);
            if(!monoPrint) monoPrint = new MonoPrint(myFile, jobFolder);
            if(!monoPrint.tech) return ['nach Abbildung'];
            
            switch (monoPrint.tech.toUpperCase()) {
                case 'SD' :
                    if(monoPrint.film) {
                        var monoFilm = new MonoFilm(monoPrint.film);
                        var spotNames = monoFilm.get_spotNames();
                        monoFilm.filmDoc.close(SaveOptions.no);
                        return spotNames;
                    }
                break;

                case 'FLK' :
                case 'FLX' : return ['Folie XY'];
                break;

                case 'SUB' : return ['CYMK / Foto'];
                break;
                
                case 'DTG' : return ['CMYK-Digitaldruck]'];
                break;
                
                case 'STK' : return ['Garn XY'];
                break;
                
                default : return ['nach Abbildung'];
            }
        },

        check_size : function () {
            var placedWidth = this.get_width();
            var sizesMatch;
            if(!jobFolder) jobFolder = check_folder(myFolder);
            if(!monoPrint) monoPrint = new MonoPrint(myFile, jobFolder);
            switch(monoPrint.tech.toUpperCase()) {
                case 'SD' :               
                    if(monoPrint.film) {
                        var monoFilm = new MonoFilm(monoPrint.film);
                        var sepPos = monoFilm.get_sepPos();
                        var sepWidth = monoFilm.get_sepWidth();
                        monoFilm.filmDoc.close(SaveOptions.no);
                        
                        var sizesMatch = (placedWidth.toFixed(0) == sepWidth.toFixed(0));
                    }
                break;

            }
            return sizesMatch;
        },

        get_order : function () {
            var myGraphics = [];
            var printsLayer = app.activeDocument.layers.item('Prints');
            
            // get allGraphics on same page on layer 'Prints'
            for(var i=0; i < page.allGraphics.length; i++) {
                var g = page.allGraphics[i];
                if(g.itemLayer == printsLayer) {
                    myGraphics.push(g)
                }
            }
            
            // sort them by x Position of centerpoint of the item (from left to right)
            myGraphics.sort(function(a,b){
                var aCenter = get_midPoint (a);
                var bCenter = get_midPoint (b);
                return aCenter[0] - bCenter[0];
            })

            //get the index of the selected Graphic
            //so the listener can update the correct row of the table
            if(app.selection.length > 0) {
                var selectionID = app.selection[0].allGraphics[0].id;
                for(var i = 0; i < myGraphics.length; i++) {
                    if (myGraphics[i].id == selectionID) {
                        return i;
                    }
                }
            }
        },

        get_id : function () {
            if(ref) return ref.id;
        }
    }
};