﻿var ioFile = require('ioFile');
var rE = require('rE');

switch (BridgeTalk.appName) {
    case 'photoshop' : historyFileName = 'recentFiles-PS.txt';
    break;
    case 'indesign' : historyFileName = 'recentFiles-ID.txt';
    break;
    case 'illustrator' : historyFileName = 'recentFiles-AI.txt';
}
var historyFile = new File ('~/documents/adobeScripts/' + historyFileName);

if(!historyFile.exists) {ioFile.write_file(historyFile, [].toSource())};

var lastFiles = import_history(historyFile);
lastFiles = lastFiles.filter(function(elem) {return File(elem).exists});

var csroot = (new Folder($.getenv("csroot"))).fullName;
var screen = get_primary_screen();
var maxDialogRowes = 100;
var maxRecentFolders = 200;

function get_primary_screen () {
    var screens = $.screens;    
    for (var i=0, len=screens.length; i < len ; i++) {
        if(screens[i].primary === true) {
        return screens[i]
        }
    }
}

function move_to_top (idx) {
    if(idx >= 0 && idx < lastFiles.length) {
        var tmp = lastFiles.splice(idx,1);
        lastFiles.unshift(tmp[0]);
    }
}

function export_history () {
    var str = lastFiles.toSource();
    var success = ioFile.write_file(historyFile, str);
    return success;
}

function import_history () {
    var str = ioFile.read_file(historyFile);
    var ev = eval(str);
    if(ev instanceof Array && ev.length > 0) {
        return ev;
    } else {
        return [];
    }
}

function remove_file(aFile) {
    if(aFile instanceof File) {
        var aFile = aFile.fullName;
    }
    
    var result = lastFiles.filter(function(elem) {return elem !== aFile});
    
    $.writeln('removed "' + aFile + '" from recentFiles');
    lastFiles = result;
    
    export_history();
}

function add_file(aFile) {
    
    if(!aFile) return;
    if(!(aFile instanceof File)) return;
    if(!aFile.exists) return;
    
    // check if this folder is already in the lastFolder
    var index = lastFiles.findIndex(function(lF){return lF == aFile.fullName});

    if(index > -1) {                
        move_to_top(index);
    } else {            
        // if not included, add to the front of the array
        lastFiles.unshift(aFile.fullName);
        $.writeln('added "' + aFile.displayName + '" to recentFiles');
    }
    
    if(lastFiles.length > maxRecentFolders) {
        $.writeln('dropped "' + lastFiles.pop() + '" from recentFiles');
    }

    export_history();
};



function show_dialog () {
    
    function get_subfolders (fd) {
        var subs = fd.getFiles(function (fd) {return fd.constructor.name == 'Folder';});
        return subs;
    }

    function select_helper (i) {
        return function () {
            retval = new File(lastFiles[i]);
            win.close();
        }
    }

    function remove_helper (aFullName,fileRow){
        return function () {
            remove_file(aFullName);
            filesPnl.remove(fileRow);
            filesPnl.layout.layout();
            //win.close();
        }
    }

    function browse_Helper_file (path) {
        return function () {
            var result = File(path).openDlg('Datei wählen');
            if(result) {
                retval = result;
                win.close();
            }
        }
    }

    var retval;
    
    // bounds = [left, top, right, bottom]
    var win = new Window("dialog", "monos lastFiles Tool",undefined);
    this.windowRef = win;
    
    var p = win.add("panel" , undefined);
    //p.size = [750,800];

    var filesPnl = p.add("group");
    filesPnl.margins = [0,0,15,0];
    filesPnl.spacing = 2;
    filesPnl.orientation = "column";
    filesPnl.alignment = "left";
    filesPnl.maximumSize.height = lastFiles.length*50;

    
    var manualGrp = win[manualGrp] = win.add("group", undefined);

    var b2bBtn = manualGrp.add("button", undefined, 'B2B');
    b2bBtn.preferredSize.width = 50;                
    b2bBtn.onClick = browse_Helper_file(csroot + '/kundendaten/b2b');
    
    var b2cBtn = manualGrp.add("button", undefined, 'B2C');
    b2cBtn.preferredSize.width = 50;
    b2cBtn.onClick = browse_Helper_file(csroot + '/kundendaten/b2c');
    
    var angBtn = manualGrp.add("button", undefined, 'ANG');
    angBtn.preferredSize.width = 50;
    angBtn.onClick = browse_Helper_file(csroot + '/angebotedaten');
    
    var cancelBtn = manualGrp.add("button", undefined, 'Cancel');

    var maxLength = lastFiles.length < maxDialogRowes ? lastFiles.length : maxDialogRowes;
    var aFullName,aFileName, aFilePath, upstreamTree;
    for (var i = 0; i < maxLength; i++) {
        var fileRow = filesPnl.add('group');
        fileRow.margins = [0,0,0,0];
        aFullName = lastFiles[i];
        aFileName = aFullName.substring(aFullName.lastIndexOf('/')+1, aFullName.length);
        aFilePath = aFullName.substring(0,aFullName.lastIndexOf('/'));
        upstreamTree = aFilePath.split('/').slice(-3).join('  /  ');
        
        var parentTxt = fileRow['parentTxt'] = fileRow.add('statictext {justify:"right"}');
        parentTxt.preferredSize.width = 400;
        parentTxt.text = upstreamTree;
        parentTxt.alignment = 'center';

        var btn = fileRow['btn'] = fileRow.add('button {justify:"right"}');
        btn.preferredSize.width = 250;
        btn.text = aFileName;
        btn.justify ='left';
        
        btn.onClick = select_helper (i);

        var browseFileBtn = fileRow.add("button", undefined,'Datei suchen');
        browseFileBtn.onClick = browse_Helper_file (aFilePath);
        
        var removeBtn = fileRow.add("button", undefined, '-');
        removeBtn.preferredSize.width = 25;
        removeBtn.onClick = remove_helper(aFullName,fileRow);
    }

    var scrollBar = p.add("scrollbar");
    scrollBar.preferredSize.width = 50;
    scrollBar.stepdelta = 50;
    scrollBar.maximumSize.height = p.maximumSize.height;

    scrollBar.onChanging = function () {
        filesPnl.location.y = -1 * this.value;
    }

    win.onShow = function() {
        scrollBar.size = [20,p.size.height];
        scrollBar.location = [p.size.width-20, 0];
        scrollBar.maxvalue = filesPnl.size.height-p.size.height+20;
    };        
        
    if(win.show() != 2 && retval) {
        if(retval instanceof File) {
            add_file(retval);
            return retval;
        }
    } else {
        return null;
    }
};

function get_file () {
    return show_dialog();
}

//~ show_dialog();

exports.get_file = get_file;
exports.add_file = add_file;