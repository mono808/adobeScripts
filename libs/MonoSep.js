function MonoSep(sep) {
    if (sep instanceof File) {
        this.file = sep;
        this.name = sep.name;
    } else {
        this.graphic = sep;
        this.rect = this.graphic.parent;
        this.name = this.graphic.properties.itemLink.name;
        this.file = new File(this.graphic.properties.itemLink.filePath);
    }

    this.folder = this.file.parent;
}

MonoSep.prototype.resize = function (newWidth, newHeight, rotationAngle) {
    var oldWidth = this.get_width();
    var oldHeight = this.get_height();

    var widthRatio = newWidth / oldWidth;
    var heightRatio = newHeight / oldHeight;

    this.rect.resize(
        CoordinateSpaces.innerCoordinates,
        AnchorPoint.centerAnchor,
        ResizeMethods.multiplyingCurrentDimensionsBy,
        [widthRatio, heightRatio]
    );
    this.graphic.rotationAngle = rotationAngle;
    this.graphic.fit(FitOptions.PROPORTIONALLY);
};

MonoSep.prototype.get_width = function () {
    return (
        this.graphic.geometricBounds[3] - this.graphic.geometricBounds[1]
    );
};

MonoSep.prototype.get_height = function () {
    return (
        this.graphic.geometricBounds[2] - this.graphic.geometricBounds[0]
    );
};

MonoSep.prototype.get_spots = function () {
    var MonoFilm = require("MonoFilm");
    var tempFilm = new MonoFilm(undefined, true);
    tempFilm.place_sep(this.file);
    var spots = tempFilm.get_all_spotColors();
    var spotNames = [];
    for (var i = 0; i < spots.length; i++) {
        spotNames.push(spots[i].name);
    }

    tempFilm.filmDoc.close(SaveOptions.ASK);
    this.spots = spotNames;
    return this.spots;
};

MonoSep.prototype.get_graphic = function () {
    if (app.activeDocuments.length > 0) {
        var doc = app.activeDocuments;
        for (var i = 0; i < doc.allGraphics.length; i++) {
            var g = doc.allGraphics[i];
            if (this.name == g.properties.itemLink.name) {
                this.graphic = g;
                return g;
            }
        }
    }
};

exports = module.exports = MonoSep;
