function PasserFab (filmType, xCenter, sep)
{
    this.settings = {
        stroke1 : 0.25,
        stroke2 : 0.6,
        circle : 4.5,
        dia1 : 10,
        dia2 : 10,
        dia3 : 16.5,
        distance : 2.5,
    };
    this.pictoScale = 0.75;

    this.doc = app.activeDocument;
    this.page = app.activeWindow.activePage;
    this.sep = sep;
    this.xCenter = xCenter;
    this.filmType = filmType;
    this.regMarkCoordinates = this.get_regMarkCoordinates(this.sep);
    this.regColor = this.doc.colors.item('Registration'),
    this.noColor = this.doc.swatches.item('None'),
    this.regLayer = this.doc.layers.item("passerEbene");    
    
    try{this.regLayer.name}
    catch (myError){
        this.regLayer = this.doc.layers.add({name:"passerEbene"});
    }
};

PasserFab.prototype.create_centerMark = function (xy, name)
{
    var pS = this.settings;

    /*pobj = {
        center : true,
        picto : null
        xy : coords[pos],
    }*/

    var oldActiveLayer = this.doc.activeLayer;
    this.doc.activeLayer = this.regLayer;
    
    var pGroup = [], 
        centerMark, 
        x = xy[0],
        y = xy[1],
        noC = this.noColor,
        regC = this.regColor;
      
    // create Kreuz

    var circle =    this.page.ovals.add(this.regLayer, undefined, undefined,        {strokeWeight:pS.stroke2, fillColor:noC, strokeColor:regC, geometricBounds: [y-pS.circle/2, x-pS.circle/2, y+pS.circle/2, x+pS.circle/2]});
    var gLH =       this.page.graphicLines.add(this.regLayer, undefined, undefined, {strokeWeight:pS.stroke2, fillColor:noC, strokeColor:regC, geometricBounds: [y, x-pS.dia2/2, y, x+pS.dia2/2] });
    var gLV =       this.page.graphicLines.add(this.regLayer, undefined, undefined, {strokeWeight:pS.stroke2, fillColor:noC, strokeColor:regC, geometricBounds: [y-pS.circle/2, x, y+pS.circle/2, x] });
    var gLHhair =   this.page.graphicLines.add(this.regLayer, undefined, undefined, {strokeWeight:pS.stroke1, fillColor:noC, strokeColor:regC, geometricBounds: [y, x-pS.dia3/2, y, x+pS.dia3/2] });
    var gLVhair =   this.page.graphicLines.add(this.regLayer, undefined, undefined, {strokeWeight:pS.stroke1, fillColor:noC, strokeColor:regC, geometricBounds: [y-pS.circle, x, y+pS.circle, x] });
    
    pGroup.push(circle,gLH,gLHhair,gLV,gLVhair);
    centerMark = this.page.groups.add(pGroup);
    centerMark.name = name;
   
    this.doc.activeLayer = oldActiveLayer;
    return centerMark;
};

PasserFab.prototype.create_regMark = function (xy)
{
    var pS  = {
        stroke : 0.35,
        rad1 : 2.5,
        rad2 : 4,
        cross : 4
    };

    var oldActiveLayer = this.doc.activeLayer;
    this.doc.activeLayer = this.regLayer;
    
    var x = xy[0];
    var y = xy[1];
    var noC = this.noColor;
    var regC = this.regColor;    

    var cBounds = [y-pS.rad1, x-pS.rad1, y+pS.rad1, x+pS.rad1];
    var c2Bounds = [y-pS.rad2, x-pS.rad2, y+pS.rad2, x+pS.rad2];
    var c3Bounds = [y-pS.rad2+pS.stroke/2, x-pS.rad2+pS.stroke/2, y+pS.rad2-pS.stroke/2, x+pS.rad2-pS.stroke/2];
    
    var cIn = this.page.ovals.add({geometricBounds : cBounds, fillColor: regC, strokeColor : noC});
    
    var c2 = this.page.ovals.add({geometricBounds : c2Bounds, fillColor: regC, strokeColor : noC});
    var c3 = this.page.ovals.add({geometricBounds : c3Bounds, fillColor: regC, strokeColor : noC});
    var cOut = c2.makeCompoundPath(c3);

    var vBounds = [y-pS.cross, x-pS.stroke/2, y+pS.cross, x+pS.stroke/2];
    var hBounds = [y-pS.stroke/2, x-pS.cross, y+pS.stroke/2, x+pS.cross];
     
    // create Kreuz
    var vRec = this.page.rectangles.add({itemLayer: this.regLayer, fillColor:regC, strokeColor:noC, geometricBounds: vBounds });
    var hRec = this.page.rectangles.add({itemLayer: this.regLayer, fillColor:regC, strokeColor:noC, geometricBounds: hBounds });
    var cross = vRec.addPath(hRec);

    regMark = cIn.excludeOverlapPath(hRec);
    regMark = regMark.addPath(cOut);
    return regMark;
};

PasserFab.prototype.create_pictoBags = function (centerMark) 
{
    var pictogram = this.page.rectangles.add(this.regLayer, undefined, undefined, {geometricBounds:[2,1,10,9]});
    var henkel = this.page.rectangles.add(this.regLayer, undefined, undefined, {geometricBounds:[0,3,2,7]});

    pictogram.makeCompoundPath(henkel);
    with(pictogram){
        name = 'pictoBags';
        fillColor = this.noColor;
        strokeColor = this.regColor;
        strokeWeight = 0.5;
    }
    var scale = this.pictoScale;
    pictogram.resize(CoordinateSpaces.innerCoordinates, AnchorPoint.centerAnchor, ResizeMethods.multiplyingCurrentDimensionsBy, [scale, scale]);
    pictogram.move([centerMark.geometricBounds[3]+1,centerMark.geometricBounds[0]]);

    return pictogram;
};

PasserFab.prototype.create_pictoShirt = function (centerMark)
{
    var torso = this.page.rectangles.add(this.regLayer, undefined, undefined, {geometricBounds:[3,2,10,8]});
    var arms = this.page.rectangles.add(this.regLayer, undefined, undefined, {geometricBounds:[0,0,4,10]});
    var neck = this.page.ovals.add(this.regLayer, undefined, undefined, {geometricBounds:[-2,3,2,7]});
    
    var pictogram = arms.addPath(torso);
    neck.subtractPath(pictogram);
    with(pictogram){
        name = 'pictoShirt';
        fillColor = this.noColor;
        strokeColor = this.regColor;
        strokeWeight = 0.5;
    }
    var scale = this.pictoScale;
    pictogram.resize(CoordinateSpaces.innerCoordinates, AnchorPoint.centerAnchor, ResizeMethods.multiplyingCurrentDimensionsBy, [scale, scale]);
    pictogram.move([centerMark.geometricBounds[3]+1,centerMark.geometricBounds[0]]);        
    return pictogram;
};

PasserFab.prototype.create_pictoNull = function (centerMark)
{
    var tfBounds = [0,0,6,6];
          
    var myTF = this.page.textFrames.add(this.regLayer, {geometricBounds:tfBounds, fillColor: this.noColor});
    myTF.contents = '!?';
    myTF.name = 'pictoNull';

    var myText = myTF.paragraphs[0];
    myText.pointSize = this.pictoScale*30;
    myText.fillColor = this.regColor;
    myText.strokeColor = this.noColor;
                    
    myTF.move([centerMark.geometricBounds[3]+1,centerMark.geometricBounds[0]]);
    return myTF;
};

PasserFab.prototype.get_regMarkCoordinates = function ()
{
    var sepHeight = this.sep.get_height(),
        sepWidth = this.sep.get_width(),
        sepBounds = this.sep.graphic.geometricBounds,
        xCenter = sepBounds[1]+sepWidth/2,
        yCenter = sepBounds[0]+sepHeight/2,
        pS = this.settings,
        xC = this.xCenter,
        cPs = []; //Array of regMark centerPoints

    // 8 regMark locations, starting at top left, clockwise
    // top left
    cPs[0] = [sepBounds[1] - pS.distance - pS.dia1/2, sepBounds[0] - pS.distance - pS.dia1/2];

    // top center
    cPs[1] = [xCenter, sepBounds[0] - pS.distance - pS.dia1/2];

    // top right
    cPs[2] = [sepBounds[3] + pS.distance + pS.dia1/2, sepBounds[0] - pS.distance - pS.dia1/2];

    // center right
    cPs[3] = [sepBounds[3] + pS.distance + pS.dia1/2, sepBounds[0] + sepHeight/2];   
    
    // bottom right
    cPs[4] = [sepBounds[3] + pS.distance + pS.dia1/2, sepBounds[2] + pS.distance + pS.dia1/2];
    
    // bottom center
    cPs[5] = [xCenter, sepBounds[2] + pS.distance + pS.dia1/2];

    // bottom left
    cPs[6] = [sepBounds[1] - pS.distance - pS.dia1/2, sepBounds[2] + pS.distance + pS.dia1/2];

    // center left
    cPs[7] = [sepBounds[1] - pS.distance - pS.dia1/2, sepBounds[0] + sepHeight/2];

    return cPs;
};

PasserFab.prototype.add_centerMarks = function () 
{
    var sepBounds = this.sep.graphic.geometricBounds;
    var pS = this.settings;
    cTop    = [this.xCenter, sepBounds[0] - pS.distance - pS.dia1/2];
    cBottom = [this.xCenter, sepBounds[2] + pS.distance + pS.dia1/2];

    var topMark = this.create_centerMark(cTop,'topMark');
    var bottomMark = this.create_centerMark(cBottom, 'bottomMark');

    switch(this.filmType) {
        case 'Shirts' :
            this.create_pictoShirt(topMark);
            break;
        case 'Bags' : 
            this.create_pictoBags(bottomMark);
            break;
        case 'Null' : 
            this.create_pictoNull(topMark);             
            break;
    }
};

PasserFab.prototype.add_regMarks = function (positions)
{
    var coords = this.get_regMarkCoordinates();
    var pos, passer;
    for (var i = 0; i < positions.length; i++) {
        pos = positions[i];
        this.create_regMark(coords[pos]);
    }
};
