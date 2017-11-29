function MonoGraphic (myGraphic)
{
    this.ref = myGraphic;
    this.doc = myGraphic.parentPage.parent.parent;
    this.page = this.ref.parentPage;
    this.fileName = myGraphic.properties.itemLink.name;
    this.filePath = myGraphic.properties.itemLink.filePath;
    this.myFile = File(this.filePath);
    this.myFolder = this.myFile.parent;    
    this.jobFolder = (function check_folder (fldr) 
    {
        var jobFolder
        if (rE.jobNr.test(fldr.displayName)) {
            jobFolder = fldr;
        } else {
            jobFolder = check_folder(fldr.parent)
        }
        return jobFolder;
    })(this.myFolder);
    this.textil_link = (function set_textil_link (graphic) 
    {
        function check_if_geoBounds1_within_geoBounds2 (gB1, gB2) {
            var y1,x1,y2,x2,
                retval = true;
            y1 = (gB1[0] > gB2[0]);
            x1 = (gB1[1] > gB2[1]);
            y2 = (gB1[2] < gB2[2]);
            x2 = (gB1[3] < gB2[3]);
            return (y1 && x1 && y2 && x2);
        }

        var textil, t, link,
            doc = graphic.parentPage.parent.parent,
            layer = doc.layers.item('Textils'),
            page = graphic.parentPage;

        for (t = 0; t < layer.allGraphics.length; t++) {
            textil = layer.allGraphics[t];
            //link = textil.itemLink;
            link = textil.itemLink ? textil.itemLink : textil;
            if (link && textil.parentPage === page) {
                if(check_if_geoBounds1_within_geoBounds2(graphic.geometricBounds, textil.geometricBounds)) {
                    return link;
                }
            }
        }
    })(myGraphic);
    this.printTag = rE.printTag.test(this.myFile.displayName) ? rE.printTag.exec(this.myFile.displayName)[0] : this.fileName;
    this.nfo = rE.printTag.test(this.printTag) ? job.get_nfo_from_filename(this.myFile) : null;
    this.divider = this.doc.guides.item('sideDivider');
    this.side = myGraphic.geometricBounds[3] < this.divider.location ? 'Front' : 'Back';
};

MonoGraphic.prototype.get_width = function () {
    return (this.ref.geometricBounds[3] - this.ref.geometricBounds[1]).toFixed(0);
};

MonoGraphic.prototype.get_page = function () {
    return this.ref.parentPage;
};

MonoGraphic.prototype.get_nfo = function (prop) {
    if(prop && this.nfo && this.nfo[prop])
    {
        var mN = new MonoNamer();
        return mN.name(prop, this.nfo[prop]);
    } 
    else 'XXX';
};

MonoGraphic.prototype.get_stand = function () {
    function roundHalf(num) {
        num = (Math.round(num*2))/2;
        return num;
    }
    
    function calculate_printD (verticalD) {
        
        if(verticalD > 0 && f_id_mock.getScale() == 6.5) {
            // mm -> cm * 0,1 * 1,075 (bei Shirts Faktor für die Krümmung der Brust / Schulterblätter innerhalb der ersten 13 cm ab Kragen)
            if(verticalD > 130) {
                printD = (130*0.1075 + (verticalD-130)*0.1).toFixed(2);
            } else {
                printD = (verticalD*0.1075).toFixed(2);
            }
        } else {
            printD = (verticalD*0.1).toFixed(2);
        }
        return roundHalf(printD);
    }

    function get_verticalD(geoBounds, yRef) {
        if(geoBounds[0] > yRef) {
            return geoBounds[0] - yRef;
        } else if (geoBounds[2] < yRef) {
            return geoBounds[2] - yRef;
        }
    }

    var yFront, yBack, y;
    try {
        yFront = this.ref.parentPage.graphicLines.item('necklineFront').geometricBounds[0],
        yBack = this.ref.parentPage.graphicLines.item('necklineBack').geometricBounds[0];
    } catch(e) {
        yFront = this.ref.parentPage.guides.item('necklineFront').location,
        yBack = this.ref.parentPage.guides.item('necklineBack').location;
    }

    if(this.side === 'Front') {
        y = yFront;
    } else if (this.side === 'Back') {
        y = yBack;
    }
    
    var verticalDistance = get_verticalD(this.ref.geometricBounds, y)    
    return calculate_printD(verticalDistance);
};

MonoGraphic.prototype.get_textil_color = function () {    
    var textil = this.textil_link.parent,
        textilLayers = textil.graphicLayerOptions.graphicLayers,
        t = textilLayers.length-1;
    
    if(textilLayers.length > 0) {            
        do {
            textilLayer = textilLayers[t];
            if(textilLayer.currentVisibility && textilLayer.name != 'Shirt') {
                return textilLayer.name;
            }
        } while(t--)
    } else {
        return ('XXX');
    }
};
    
MonoGraphic.prototype.get_textil_name = function () {
    if(this.textil_link && this.textil_link.name) {
        var fname = this.textil_link.name
        return fname.substring(0, fname.lastIndexOf('.'));
    } else {
        return 'n Shirt';
    }
};

MonoGraphic.prototype.get_film = function () {
    var film = Folder(this.jobFolder.fullName + '/Druckdaten-SD').getFiles(new RegExp(this.printTag + '_Film.indd', "i"));
    if (film.length > 0) { return film[0]; }
    else { return null; }
};

MonoGraphic.prototype.get_previewFile = function () {
    return Folder(this.jobFolder.fullName + '/Previews').getFiles(new RegExp(this.printTag + '_Preview.*'));
};

MonoGraphic.prototype.get_druckFile = function () {
    return Folder(this.jobFolder.fullName + '/Druckdaten-SD').getFiles(new RegExp(decodeURI(printTag) + '*.(eps|ai)'));
};

MonoGraphic.prototype.get_colors = function (film) {
    var tech = (this.nfo && this.nfo.tech) ? this.nfo.tech : null;
    switch (tech) 
    {
        case 'SD' :
            var film = this.get_film();
            if (film)
            {
                var sepInfo = f_id_mock.getFilmInfo(film),
                    mN = new MonoNamer();
                var i = sepInfo.spotsArray.length-1;
                do{
                    sepInfo.spotsArray[i] = mN.name('color', sepInfo.spotsArray[i]);
                }while(i--)
                return sepInfo.spotsArray;
            }
        break;

        case 'FLK' :
        case 'FLX' : return 'Folie XY';
        break;

        case 'SUB' : return 'CYMK / Foto';
        break;
        
        case 'DTG' : return 'CMYK-Digitaldruck';
        break;
        
        case 'STK' : return 'Garn XY'
        break;
        
        default : return 'nach Abbildung';
    }
};

MonoGraphic.prototype.check_size = function () {
    if(this.nfo) {
        var gWidth = (this.ref.geometricBounds[3] - this.ref.geometricBounds[1]).toFixed(0);
        var nfoWidth = this.nfo.wxh.substring(0, this.nfo.wxh.indexOf('x'));
        if(gWidth == nfoWidth) {
            return true;
        } else {
            var alertStr = 'Druckgröße in Ansicht: ' + gWidth + ' passt nicht zum Dateinamen: ' + nfoWidth + '\n';
            alertStr += 'Trotzdem weitermachen?'
            var mirEgal = Window.confirm(alertStr);
            if(!mirEgal) {
                return false;
            } else {
                return true;
            }
        }
    } else {
        alert('Could not check graphicSize');
        return true;
    }
};

MonoGraphic.prototype.get_order = function () {
    var myGraphics = [],
        myPage = this.get_page(),
        i,g;
    
    // get allGraphics on same page on layer 'Prints'
    for(i=0; i<myPage.allGraphics.length; i++) {
        g = myPage.allGraphics[i];
        if(g.itemLayer == app.activeDocument.layers.item('Prints')) {
            myGraphics.push(g)
        }
    }
    
    // sort them by x Position (from left to right)
    myGraphics.sort(function(a,b){
        return a.geometricBounds[1] - b.geometricBounds[1];
    })

    //get the index of the selected Graphic
    //so the listener can update the correct row of the table
    var gID, selID = app.selection[0].allGraphics[0].id;
    for(i = 0; i < myGraphics.length; i++) {
        gID = myGraphics[i].id;
        if(gID == selID) {
            return i;
        }
    }
};