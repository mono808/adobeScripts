#include './InteractSwitch.jsx'


if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

if(typeof Object.prototype.create !== 'function') {
    Object.prototype.create = function(o) {
        var F = function () {}
        F.prototype = o;
        return new F();
    };
}

var baseDoc = {
    doc : null
};

baseDoc.get_width_and_height = function () {

    var dimensions = {};
    dimensions.width = this.doc.width.as('mm');
    dimensions.height = this.doc.height.as('mm');
    dimensions.wxh = dimensions.width.toFixed(0) + 'x' + dimensions.height.toFixed(0);
    return dimensions;
};

baseDoc.save_doc = function (dest, saveOps, close, showDialog) {

    var saveFile = dest instanceof File ? dest : new File(dest);

    if (!saveFile.parent.exists) {
        var saveFolder = new Folder(saveFile.parent)
        saveFolder.create();
    };

    if (showDialog) saveFile = saveFile.saveDlg('Please check Filename');

    try {
        switch (app.name) {
            case 'Adobe Illustrator' :
                this.doc.saveAs(saveFile, saveOps);
            break;
            case 'Adobe InDesign' :
                this.doc.save (saveFile);
            break;
            case 'Adobe Photoshop' :
                this.doc.saveAs(saveFile, saveOps);
            break;
        }
        if (close) this.doc.close();
        return saveFile;
    } catch(e) {
        alert(e);
        return null;
    }
};

baseDoc.change_filename = function (sourceFile, addString, ext) {
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

baseDoc.get_saveName = function (sourceFile, searchFor, replaceWith, extension) {
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

baseDoc.get_totalArea = function() {
    return this.doc.width.as('cm') * this.doc.height.as('cm');
};

baseDoc.place_on_film = function (sepFile, pos) {

    var blankoFilmScript = File($.getenv('pcroot') + '/adobeScripts/indesign/Film-Vorlage-erstellen.jsx');
    var finalizeScript = File($.getenv('pcroot') + '/adobeScripts/indesign/Film-finalisieren.jsx');

    indesign8.executeScriptFile(blankoFilmScript);

    var myArgs = {};
    myArgs.sep = sepFile;
    myArgs.x = pos && pos.x ? pos.x.as('mm') : null;
    myArgs.y = pos && pos.y ? pos.y.as('mm') : null;

    var bt = new BridgeTalk;
    bt.target = 'Indesign-8.0';
    bt.body = f_all.bt_position_sep_on_film.toSource() + "(" + myArgs.toSource() + ");";
    bt.onResult = function( inBT ) { $.writeln(inBT.body) };
    bt.onError = function( inBT ) { $.writeln(inBT.body) };
    bt.send(0);

    indesign8.executeScriptFile(finalizeScript);

    return;
};