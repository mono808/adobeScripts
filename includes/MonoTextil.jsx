function MonoTextil (myGraphic)
{
    this.ref = myGraphic;
    this.doc = myGraphic.parentPage.parent.parent;
    this.page = this.ref.parentPage;
    this.link = this.ref.properties.itemLink;
    this.layers = this.link.parent.graphicLayerOptions.graphicLayers;    
    this.fixedNames = /(Shirt|Front|Back|Naht)/i;
    this.sideNames = /(Front|Back)/i;
    this.fileName = this.link.name;
    this.filePath = this.link.filePath;
    this.myFile = new File(this.filePath);
    this.myFolder = this.myFile.parent;    
    this.divider = this.doc.guides.item('sideDivider');
    this.side = myGraphic.geometricBounds[3] < this.divider.location ? 'Left' : 'Right';
};

MonoTextil.prototype.get_colors = function (asStrings) {
    this.colorLayers = [];
    this.sideLayers = [];
    var gLs = this.layers,
        i,maxI;
    for(i=0, maxI = gLs.length; i < maxI; i+=1) {
        gL = gLs[i];
        if(!this.fixedNames.test(gL.name)) {
            this.colorLayers.push(gL);
        } else if (this.sideNames.test(gL.name)) {
            this.sideLayers.push(gL); 
        }
    }
    if(asStrings) {
        var strArr = [],
            i,maxI;
        for(i=0, maxI = this.colorLayers.length; i < maxI; i += 1){
            strArr.push(this.colorLayers[i].name);
        }
        return strArr;
    }
};



MonoTextil.prototype.activate_layer = function (gL2activate, cORs) {    
    if(gL2activate.constructor.name == 'String') {
        gL2activate = this.layers.item(gL2activate);
    }
    switch (cORs) {
        case 'color'
    }
    var ls = cORs ==
    var i, maxI = this.colorLayers.length,
        gL;
    for(i = 0; i < maxI; i+=1) {
        gL = this.colorLayers[i];
        if(gL.name !== gL2activate.name) {                                    
            gL.currentVisibility = false;
        } else {
            gL.currentVisibility = true;
        }
    }
};

MonoTextil.active_side = function (gL) {

};
    
MonoTextil.prototype.get_textil_name = function () {
    var fname = this.textil_link.name
    return fname.substring(0, fname.lastIndexOf('.'));
};

MonoTextil.prototype.get_colors = function (film) {
    var tech = (this.nfo && this.nfo.tech) ? this.nfo.tech : null;
    switch (tech) 
    {
        case 'SD' :
            var film = this.get_film();
            if (film)
            {
                var sepInfo = f_id_mock.getFilmInfo(film);
                var i = sepInfo.spotsArray.length-1;
                do{
                    sepInfo.spotsArray[i] = monoNamer.name('color', sepInfo.spotsArray[i]);
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

MonoTextil.prototype.get_order = function () {
    var myGraphics = [],
        myPage = this.get_page(),
        i,g;
    
    // get allGraphics on same page on layer 'Prints'
    for(i=0; i<myPage.allGraphics.length; i++) {
        g = myPage.allGraphics[i];
        if(g.itemLayer == app.activeDocument.layers.item('Textils')) {
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

