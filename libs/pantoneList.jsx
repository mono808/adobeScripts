var pantoneFile = new File('~/Documents/AdobeScripts/pantoneList.txt');
var oldFile = new File($.getenv('pcroot') + '/adobescripts/pantones.txt');

var pantoneLib = import_pantones(pantoneFile);

convert_old_file(oldFile, pantoneLib);

export_pantone(pantoneFile, pantoneLib);

function convert_old_file(oldFile, lib) {
    oldFile.open('r', undefined, undefined);
    oldFile.encoding = "UTF-8";
    oldFile.lineFeed = "Windows";

    if (oldFile === '') return;

    var panStr = oldFile.read();
    var splitStr = panStr.split('\n');
    var panArr = [];

    for(var i=0, maxI = splitStr.length; i < maxI; i+=1) {
        var line = splitStr[i];
        if(line.indexOf('=') == -1) continue;
        
        var splitLine = line.split('=');
        if(splitLine[1] === '') continue;
        var nr = splitLine[0];
        var name = splitLine[1];
        add_pantone_color(lib, nr, name);
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
    var success = aFile.write(content.toSource());
    aFile.close();
    return success;
}

function import_pantones (aFile) {
    var content = read_file(aFile);
    var ev = eval(content);
    return ev;
}

function export_pantone (aFile, lib) {
    var str = lib.toSource();
    var result = write_file(aFile, str);
    return result;
}

function analyze_pantone_string (pString) {
    spot.name.replace('PANTONE ', '');
}

function get_pantone_color (pantoneName)
{
    var check = panNr.match(/\d{3,4}/);
    if(check.length > 0) {
        var nr = Number(check[0]);

        if(pantoneLib.hasOwnProperty[nr]) {
            return pantoneLib[nr];
        } else {
            return null;
        }
        var read_file = this.pantoneTxt;

    }
};

function add_pantone_color(lib, nr, newName)
{
    if(!nr || !newName) return;
    if(lib.hasOwnProperty(nr)) {
        var oldName = lib[nr];
        var msg = "Pantone " + nr + " already named: " + oldName;
        msg += '\r\rReplace '+ oldName + ' with ' + newName + '?';
        var replace = Window.confirm(msg,true);
        if(!replace) return;
    }
    lib[nr] = newName;

    //export_pantone(lib);
};