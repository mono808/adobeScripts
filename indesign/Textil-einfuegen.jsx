//@target indesign
//@include 'require.jsx'


(function () {
    if(!app.activeDocument) {
        alert('Please open a document first');
        return;
    }

    var texTool = require('textilTool');    
    
    texTool.add_textiles();
    texTool.choose_object_layers(app.selection);
    //texTool.flatten_textiles(app.selection);
    
})();