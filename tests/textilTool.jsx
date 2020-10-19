//@include 'require.jsx'
//@target indesign


function setup() {
    app.documents.everyItem().close(SaveOptions.NO);
    

    var scriptDir = $.fileName.substring(0, $.fileName.lastIndexOf('/'));
    var inputFile = new File(scriptDir + '/input/mockup.indd');
    app.open(inputFile);
}

function main(modjsx) {
    var texTool = require('textilTool');
    
    texTool.add_textiles();
    
    texTool.choose_object_layers(app.selection);
    
    texTool.flatten_textiles(app.selection);
    
}

function tearDown () {
    app.activeDocument.close(SaveOptions.NO);
}

setup();
main('pantoneList');
tearDown();