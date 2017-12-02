var f_ai = {
 
    check_parent : function (myItem, layer) 
    {
        switch(myItem.constructor.name) {
            case 'RasterItem' :
                return myItem.layer === layer;
            break;
            default:
                if(myItem.parent.constructor.name === 'Layer') {
                    return myItem.parent === layer;
                } else {
                    return this.check_parent(myItem.parent, layer);
                }
            break;
        }
    },

    get_all_pathItems_on_layer_old : function (layer_name) 
    {
        var pI,i,
            sep_items = [],
            doc = app.activeDocument,
            l = doc.layers.getByName(layer_name),
            i = doc.pathItems.length-1;

        do {
            pI = doc.pathItems[i];
            if(!pI.clipping && this.check_parent(pI,l)) {sep_items.push(pI)};
        } while (i--);

        return sep_items;
    },

    get_all_pathItems_on_layer : function (layer_name) 
    {        
        var sep_items = [];
        var doc = app.activeDocument;
        var l = doc.layers.getByName(layer_name);

        var pI;
        var i = doc.pathItems.length-1;
        do {
            pI = doc.pathItems[i];
            if(pI.layer == l) {sep_items.push(pI)};
        } while (i--);

        return sep_items;
    },

    get_all_rasterItems_on_layer : function (layer_name) 
    {
        var rI, i,
            myRasterItems = [],            
            doc = app.activeDocument,
            l = doc.layers.getByName(layer_name);
        
        try{ i = doc.rasterItems.length-1; }
        catch(e) { return myRasterItems; }

        if(i > -1) {
            do {
                rI = doc.rasterItems[i];
                if(rI.layer == l) {
                    myRasterItems.push(rI);
                }
            } while (i--);
        }

        return myRasterItems;
    },

    select_all_pageItems_on_layer : function (layer_name)
    {
        var doc = app.activeDocument,
            l = doc.layers.getByName('layer_name'),
            pIs = l.pageItems,
            sel = [];

        var i, maxI = pIs.length, pI;
        for(i=0; i < maxI; i+=1)
        {
            pI = pIs[i];
            sel.push(pI);
        }
        return sel;
    },

    fit_artboard_to_art : function (artlayer_name) 
    {
        var myDoc = app.activeDocument,
            artLayer = myDoc.layers.getByName(artlayer_name),
            selection = [],
            i = null;

        i = artLayer.pageItems.length-1;
        do {
            selection.push(artLayer.pageItems[i]);
        } while (i--);
        
        myDoc.selection = selection;
        myDoc.fitArtboardToSelectedArt(0);

        // var tempGroup = myDoc.groupItems.add(selection);
        // tempGroup.pageItems = null;
        // tempGroup.remove();

        return;
    },

    delete_layer : function  (layer_name) 
    {
        function recursive_delete_layer (ly) {
            ly.locked = false;
            ly.visible = true;
            
            if(ly.layers.length > 0) {
                var i, nestedLayer;
                i = ly.layers.length-1;
                do {
                    nestedLayer = ly.layers[i];
                    recursive_delete_layer(nestedLayer);
                } while (i--);
            }

            
            if(ly.pageItems.length > 0) {
                var j, pI;            
                j = ly.pageItems.length-1;
                do {
                    pI = ly.pageItems[j];
                    pI.locked = false;
                    pI.hidden = false;
                    pI.remove();
                } while (j--);
            }
            ly.remove();
        }

        try {
            var l = app.activeDocument.layers.getByName(layer_name);
            recursive_delete_layer(l);
        } catch (e) {
            $.writeln('AI: no layer named ' + layer_name + ' found!');
            return;
        }
    },
    restart_illu : function () {
        
        // sends a bridgetalk message from illu to estoolkit
        // which then sends bridgetalk messages back to illustrator
        // to close and restart illustrator
        function restart_func () {
            
            function bt_func (target, script2send) {
                var btMessage = new BridgeTalk;
                btMessage.target = target;
                btMessage.body = script2send;
                btMessage.onResult = function(bto) {$.writeln('AI: ' + bto.body);};
                btMessage.onError = function(bto) {$.writeln('AI: ' + bto.body);};
                btMessage.send();
            }

            var readFile = File('/c/capri-links/scripts/includes/00-IlluAutoOpener.jsx');
            readFile.open('r', undefined, undefined);
            readFile.encoding = "UTF-8";      
            readFile.lineFeed = "Windows";

            if (readFile !== '') {
                var myScript = readFile.read();
                
                bt_func('illustrator', 'app.quit();');        
                
                $.sleep(5000);
                
                bt_func('illustrator', myScript);
            } else {
                return ('no autorestart script file found');
            }
        }
        
        var btMessage = new BridgeTalk;
        btMessage.target = 'estoolkit';
        btMessage.body = restart_func.toSource() + "()";
        btMessage.onResult = function(bto) {$.writeln('AI: ' + bto.body);};
        btMessage.onError = function(bto) {$.writeln('AI: ' + bto.body);};
        btMessage.send();        
    },
}
