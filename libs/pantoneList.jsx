var scriptDir = $.fileName.substring(0, $.fileName.lastIndexOf('/'));
var pantoneFile = new File(scriptDir + '/pantoneList.txt');
var pantoneFileLegacy = new File($.getenv('pcroot') + '/adobescripts/pantones.txt');

var pantoneList = import_pantoneList();

function import_pantoneList_legacy () {
    var pF = pantoneFileLegacy;
    pF.open('r', undefined, undefined);
    pF.encoding = "UTF-8";
    pF.lineFeed = "Windows";

    if (pF === '') return;

    var panStr = pF.read();
    var splitStr = panStr.split('\n');
    var panArr = [];

    for(var i=0, maxI = splitStr.length; i < maxI; i+=1) {
        var line = splitStr[i];
        if(line.indexOf('=') == -1) continue;
        
        var splitLine = line.split('=');
        if(splitLine[1] === '') continue;
        var nr = splitLine[0];
        var name = splitLine[1];
        add_color(nr, name);
    }
}

function read_file (aFile) {     
    if(aFile && aFile instanceof File) {
        aFile.open('r', undefined, undefined);
        aFile.encoding = "UTF-8";      
        aFile.lineFeed = "Windows";
        var success = aFile.read();
        aFile.close();
        return success;
    }
}

function write_file (aFile, content) {
    aFile.close();
    var out = aFile.open('w', undefined, undefined);            
    aFile.encoding = "UTF-8";
    aFile.lineFeed = "Windows";
    var success = aFile.write(content);
    aFile.close();
    return success;
}

function import_pantoneList (aFile) {
    if (!pantoneFile.exists) return {};
    
    var imported = $.evalFile(pantoneFile);
    if(typeof(imported) !== 'object') return {};
    
    return imported;
}

function export_pantoneList () {
    var str = pantoneList.toSource();
    var result = write_file(pantoneFile, str);
    return result;
}

function prompt_user(pantoneName, color) {
    var msg = '';
    if(color) {
        msg += "Pantone " + pantoneName + " wurde schon benannt: " + color;
        msg += '\r\rÜberschreiben oder mit Enter bestätigen';
    } else {
        msg += 'Farbname für ' + pantoneName + 'angeben:';
    }

    var userInput = Window.prompt (msg , color || '', "mono's Pantone ReNamer");
    
    if(!userInput) return null;
    
    return String(userInput);

}
function get_color(nr) {
    if(!nr) return null;
    if(pantoneList.hasOwnProperty(nr)) {
        return pantoneList[nr];
    }
    return null;
}
    

function add_color(nr, newName, overwrite) {
    if(!nr || !newName) return;
    
    if(overwrite) {
        pantoneList[nr] = newName;
        export_pantoneList();
        return;
    }
    
    if(pantoneList.hasOwnProperty(nr)) {
        var oldName = pantoneList[nr];
        if(newName == oldName) return;
        
        var msg = "Pantone " + nr + " already named: " + oldName;
        msg += '\r\rReplace '+ oldName + ' with ' + newName + '?';
        var replace = Window.confirm(msg,true);
        if(!replace) return;
    }

    pantoneList[nr] = newName;

    export_pantoneList();
}

function create_colored_blob (color) {
    app.redraw();
    var doc = app.activeDocument;
    var tempColor = new SpotColor();

    try {
        var cP = doc.activeView.centerPoint;
        var zf = doc.activeView.zoom;
        var size = 500/zf;
    } catch (e) {
        var cP = [0,0];
        var zf = 1;
        var size = 500/zf;
        $.writeln('Illu PARMED, again... =/');
    }
    var blob = doc.pathItems.ellipse(cP[1]+size/2,  cP[0]-size/2,  size,  size);

    //tempColor.spot = spotColor;
    blob.fillColor = color;
    blob.stroked = false;
    return blob;
}

exports.rename_pantone = function (pantoneName, colorValue) {

    if(pantoneName.indexOf('PANTONE ') == -1) return pantoneName;

    var pantoneName = pantoneName.replace('PANTONE ', '');
    var hasNoColorName = /^(\d{3,4})\s(C|U)$/i;
    var match = pantoneName.match(hasNoColorName);

    // if the string contains more than numbers, it is already descriptive
    if(!match)  {
        $.writeln(pantoneName + ' muss nicht umbenannt werden');
        return pantoneName;
    }

    if (match.length == 3) {
        if(app.name == 'Adobe Illustrator' && colorValue) {
            var blob = create_colored_blob(colorValue);
            app.redraw();
        }

        var nr = match[1];
        var color = get_color (nr);
        var userInput = prompt_user(match[0], color);

        if(blob) {
            blob.remove();
            app.redraw();
        }

        if(userInput) {
            if(color != userInput) {
                add_color(nr,userInput,true);
            }
                
            return userInput + ' ' + match[0];

        } else {
            return color + ' ' + match[0];
        }
    }
};