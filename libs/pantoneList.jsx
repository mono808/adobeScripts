var scriptDir = $.fileName.substring(0, $.fileName.lastIndexOf('/'));
var pantoneFile = new File(scriptDir + '/pantoneList.txt');

//var pantoneFile = new File('~/Documents/AdobeScripts/pantoneList.txt');
var pantoneFileLegacy = new File($.getenv('pcroot') + '/adobescripts/pantones.txt');

var pantoneLib = import_pantoneList();

// import_pantones(pantoneFile);

// import_old_file(oldFile);

// export_pantone(pantoneFile, pantoneLib);

exports.import_pantoneList_legacy = function () {
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
        add_pantone_color(nr, name);
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

exports.import_pantoneList = function (aFile) {
    if (!pantoneFile.exists) return {};
    
    var imported = $.evalFile(pantoneFile);
    if(typeof(imported) !== 'object') return {};
    
    return imported;
    
//~     var content = read_file(aFile);
//~     var ev = eval(content);
//~     if(!ev.constructor.name =='Object') return {}; 
//~     pantoneLib = ev;
}

function export_pantoneList () {
    var str = pantoneLib.toSource();
    var result = write_file(pantoneFile, str);
    return result;
}

function analyze_pantone_string (pantoneString) {
    pantoneString.replace('PANTONE ', '');

    var nrOnlyRE = /^(\d{3,4})\s(C|U)$/i;

    var match = pantoneString.match(panSpot.name);

    // if the string contains more than numbers, it is already descriptive
    if(!match) return pantoneString;

    if (match.length == 3) {
        
        var userName = this.ask_user_for_new_colorname(panSpot, txtName);
        userName += match[0];
        if(!txtName) {
            this.add_to_pantone_txt(userName)
        };
        panSpot.name = userName;
    }

}

exports.get_pantone_color = function (pantoneName)
{
    pantoneString.replace('PANTONE ', '');

    var nrOnlyRE = /^(\d{3,4})\s(C|U)$/i;

    var match = pantoneString.match(panSpot.name);

    // if the string contains more than numbers, it is already descriptive
    if(!match) return pantoneString;

    if (match.length == 3) {
        
        var userName = this.ask_user_for_new_colorname(panSpot, txtName);
        userName += match[0];
        if(!txtName) {
            this.add_to_pantone_txt(userName)
        };
        panSpot.name = userName;
    }
};

function prompt_user(oldName, newNamee) {
        var msg = "Pantone " + nr + " already named: " + oldName;
        msg += '\r\rReplace '+ oldName + ' with ' + newName + '?';
        var replace = Window.confirm(msg,true);
        if(!replace) return;
}

function add_pantone_color(nr, newName)
{
    if(!nr || !newName) return;
    
    if(pantoneLib.hasOwnProperty(nr)) {
        var oldName = pantoneLib[nr];
        if(newName == oldName) return;
        
        var msg = "Pantone " + nr + " already named: " + oldName;
        msg += '\r\rReplace '+ oldName + ' with ' + newName + '?';
        var replace = Window.confirm(msg,true);
        if(!replace) return;
    }

    pantoneLib[nr] = newName;

    export_pantoneList();
};