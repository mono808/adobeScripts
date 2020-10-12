$.level = 1;

function MonoSpot (name)
{
    this.name = name;
    this.spot;
    this.pathItems = [];
    this.bounds = [];
    this.area = 0;
    this.isUB = false;
    this.sqpt2sqcm = new UnitValue(1,'pt').as('cm') * new UnitValue(1,'pt').as('cm');

    this.add_pathItem = function (pI) {
        this.pathItems.push(pI);
        this.area += pI.area*this.sqpt2sqcm;
        var gB = pI.geometricBounds;
        if(gB[0] < this.bounds[0]) this.bounds[0] = gB[0];
        if(gB[1] > this.bounds[1]) this.bounds[1] = gB[1];
        if(gB[2] > this.bounds[2]) this.bounds[2] = gB[2];
        if(gB[3] < this.bounds[3]) this.bounds[3] = gB[3];
    }
}

exports = module.exports = MonoSpot;