//@target illustrator

function main (report) {

    //@include 'require.jsx'
    var aiSiebdruck = require('AiSiebdruck');
    var areaDialog = require('AreaDialog');

    var sep = new aiSiebdruck(app.activeDocument);
    
    if(!sep.check()) return;
    
    //sort pathItems by spotcolor, putting them into indivdual "spot arrays"
    sep.sort_by_spotColor(sep.pathItems);

    sep.get_totalArea();
    
    var inkDialog = new areaDialog(sep.spots, sep.totalArea).create_win().show();

}

main();