function BaseDoc (initDoc) {
    this.doc = initDoc;
};

BaseDoc.prototype.get_width_and_height = function () {

    var dimensions = {};
    dimensions.width = this.doc.width.as('mm');
    dimensions.height = this.doc.height.as('mm');
    dimensions.wxh = dimensions.width.toFixed(0) + 'x' + dimensions.height.toFixed(0);
    return dimensions;
};

BaseDoc.prototype.save_doc = function (dest, saveOps, close, showDialog) {

    var saveDoc = app.activeDocument;

    if(dest instanceof File) {
        var saveFile = dest;
    } else {
        var saveFile =  new File(dest);
    }

    if (!saveFile.parent.exists) {
        var saveFolder = new Folder(saveFile.parent)
        saveFolder.create();
    };

    if(showDialog) saveFile = saveFile.saveDlg('Please check Filename');

    try {
        switch (app.name) {
            case 'Adobe Illustrator' :
                saveDoc.saveAs(saveFile, saveOps);
            break;
            case 'Adobe InDesign' :
                saveDoc.save (saveFile);
            break;
            case 'Adobe Photoshop' :
                saveDoc.saveAs(saveFile, saveOps);
            break;
        }

        if(close) {saveDoc.close()};
        return true;

    } catch(e) {
        alert(e);
        return false;
    }
};

BaseDoc.prototype.change_filename = function (sourceFile, addString, ext) {
    var oldName, newName = '';
    oldName = sourceFile.name;
    newName += oldName.substring(0,oldName.lastIndexOf('.'));

    if(addString && addString.constructor.name == 'Array') {
        newName = newName.replace(addString[0],addString[1]);
    } else {
        newName += addString;
    }

    if(ext.indexOf('.') < 0) {
        newName += '.';
    }
    newName += ext;

    var newFile = new File(sourceFile.parent + '/' + newName);

    return newFile;
};

BaseDoc.prototype.get_saveName = function (sourceFile, searchFor, replaceWith, extension) {
	if(sourceFile.constructor.name != 'File') throw new Error ('sourceFile not of type "File"');

    var oldName = sourceFile.name;
	var oldExtension = oldName.substring(oldName.lastIndexOf('.')+1, oldName.length);
	var newName = oldName.substring(0,oldName.lastIndexOf('.'));
	var folder = sourceFile.parent;

    if (newName.search(replaceWith) != -1) {
        throw new Error('Filename already contains ' + replaceWith);
    }

    var replacedIt = false;
    for (var i=0, len=searchFor.length; i < len ; i++) {
        if(newName.search(searchFor[i]) != -1) {
            newName = newName.replace(searchFor[i], replaceWith);
            replacedIt = true;
            break;
        }
    };

    if(!replacedIt) newName = '-' + replaceWith;

	if(extension) {
		newName += '.';
		newName += extension;
	} else {
		newName += '.';
		newName += oldExtension;
	}
	return newName;
};

BaseDoc.prototype.get_totalArea = function() {
    return this.doc.width.as('cm') * this.doc.height.as('cm');
};

BaseDoc.prototype.place_on_film = function (sepFile, pos) {

    var bt_position_sep_on_film = function (serializedmyArgs) {
        function centerOnPage (itemRef) {
            var iWidth = itemRef.geometricBounds[3] - itemRef.geometricBounds[1];
            var iHeight = itemRef.geometricBounds[2] - itemRef.geometricBounds[0];
            var myDoc = app.activeDocument;
            var pWidth = myDoc.documentPreferences.pageWidth;
            var pHeight = myDoc.documentPreferences.pageHeight;

            var centerCoor = {};
            centerCoor.x = pWidth/2 - iWidth /2;
            centerCoor.y = pHeight/2 - iHeight /2;
            itemRef.parent.move( [centerCoor.x, centerCoor.y] );
        }

        function positionSep (x,y) {
            var doc = app.activeDocument;
            var vLine = doc.pages[0].guides.item('vLine');
            var hLine = doc.pages[0].guides.item('hLine');
            mySep.parent.move( [vLine.location + x, hLine.location + y] );
        }

        var myArgs = eval(serializedmyArgs);
        var iDoc = app.activeDocument;
        var myPage = iDoc.pages[0];
        var sepLayer = iDoc.layers.item('motivEbene');
        var sepRef = myPage.place(myArgs.sep);
        var mySep = iDoc.layers.item('motivEbene').allGraphics[0];

        iDoc.activeLayer = sepLayer;

        if (myArgs.x != null && myArgs.y != null) {
            positionSep(myArgs.x, myArgs.y);
            return 'Sep placed according to PlacementInfos';
        } else {
            centerOnPage(mySep);
            return 'Sep centered on Page';
        }
    }

    var pcroot = $.getenv ('pcroot');
    var blankoFilmScript = File(pcroot + '/adobeScripts/indesign/Film-Vorlage-erstellen.jsx');
    var finalizeScript = File(pcroot + '/adobeScripts/indesign/Film-finalisieren.jsx');

    indesign.executeScriptFile(blankoFilmScript);

    var myArgs = {};
    myArgs.sep = sepFile;
    myArgs.x = pos && pos.x ? pos.x.as('mm') : null;
    myArgs.y = pos && pos.y ? pos.y.as('mm') : null;

    var bt = new BridgeTalk;
    bt.target = 'Indesign';
    bt.body = bt_position_sep_on_film.toSource() + "(" + myArgs.toSource() + ");";
    bt.onResult = function( inBT ) { $.writeln(inBT.body) };
    bt.onError = function( inBT ) { $.writeln(inBT.body) };
    bt.send(0);

    indesign.executeScriptFile(finalizeScript);

    return;
};


exports = module.exports = BaseDoc;