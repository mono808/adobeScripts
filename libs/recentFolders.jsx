var ioFile = require('ioFile');
var rE = require('rE');

var recentFoldersFile = new File ('~/documents/adobeScripts/recentFolders.txt');

if(!recentFoldersFile.exists) {ioFile.write_file(recentFoldersFile, [].toSource())};

var lastFolders = import_recentFolders(recentFoldersFile);
lastFolders = lastFolders.filter(function(fld) {return fld.exists});

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

function select_dialog (path) {
    var fd = new Folder(path).selectDlg();
    if(fd.constructor.name == 'Folder') {
        add_to_recentFolders(fd);
    }
    return fd;
}

function get_jobFolder (fld) {
    if(fld.displayName.match(rE.jobNr)) {
        return fld;
    } else if (fld.parent) {
        return get_jobFolder(fld.parent);
    } else {
        return null;
    }
}

function get_folder_from_ref (ref) {
    var fd;
    switch(ref.constructor.name) {
        case 'File' : fd = ref.parent;
        break;
        case 'Document' : 
            if(ref.saved) {
                fd = ref.fullName.parent;
            } else {
                return null;
            }
        break;
        case 'Folder' : fd = ref;
    }
    return fd;            
}

function move_to_top (idx) {
    if(idx >= 0 && idx < lastFolders.length) {
        var tmp = lastFolders.splice(idx,1);
        lastFolders.unshift(tmp[0]);
    }
}

function export_recentFolders () {
    var paths = lastFolders.map(function(fd) {
        return fd.fullName;
    })
    var str = paths.toSource();
    var success = ioFile.write_file(recentFoldersFile, str);
    return success;
}

function import_recentFolders () {
    var str = ioFile.read_file(recentFoldersFile);
    var ev = eval(str);
    if(ev instanceof Array && ev.length > 0) {
        ev = ev.map(function(path) {
            return new Folder(path)
        });
        return ev;
    } else {
        return [];
    }
}

function add_to_recentFolders(ref) {
    
    // get the folder from these possible inputs (file|document|folder)
    var fd = get_folder_from_ref(ref);
    if(!fd) return null;
    // from a folder, get to the upstream jobFolder (the one with a jobNr)
    var jobFolder = get_jobFolder(fd);
    
    // if no jobFolder found, stick to the input
    fd = jobFolder ? jobFolder : fd;
    
    // check if this folder is already in the lastFolder
    var index = lastFolders.findIndex(function(lF){return lF.displayName == fd.displayName});

    if(index > -1) {                
        move_to_top(index);
    } else {            
        // if not included, add to the front of the array
        lastFolders.unshift(fd);
    }
    
    if(lastFolders.length > maxRecentFolders) {
        lastFolders.pop();
    }

    export_recentFolders();
};



function show_dialog (get_folder, get_file) {
    
    function get_subfolders (fd) {
        var subs = fd.getFiles(function (fd) {return fd.constructor.name == 'Folder';});
        return subs;
    }

    function select_helper (i) {
        return function () {
            retval = lastFolders[i];
            win.close();
        }
    }

    function browse_Helper_folder (path) {
        return function () {
            var result = Folder(path).selectDlg('Select Job-Folder:');
            if(result) {
                retval = result;
                win.close();
            }
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
    var win = new Window("dialog", "Extracted Infos",undefined);
    this.windowRef = win;
    
    var p = win.add("panel" , undefined);
    //p.size = [750,800];

    var fdG = p.add("group");
    fdG.orientation = "column";
    fdG.alignment = "left";
    fdG.maximumSize.height = lastFolders.length*50;

    
    var manualGrp = win[manualGrp] = win.add("group", undefined);

    var b2bBtn = manualGrp.add("button", undefined, 'B2B');
    b2bBtn.preferredSize.width = 50;                
    b2bBtn.onClick = browse_Helper_folder(csroot + '/kundendaten/b2b');
    
    var b2cBtn = manualGrp.add("button", undefined, 'B2C');
    b2cBtn.preferredSize.width = 50;
    b2cBtn.onClick = browse_Helper_folder(csroot + '/kundendaten/b2c');
    
    var angBtn = manualGrp.add("button", undefined, 'ANG');
    angBtn.preferredSize.width = 50;
    angBtn.onClick = browse_Helper_folder(csroot + '/angebotedaten');
    
    var cancelBtn = manualGrp.add("button", undefined, 'Cancel');

    var maxLength = lastFolders.length < maxDialogRowes ? lastFolders.length : maxDialogRowes;
    for (var i = 0; i < maxLength; i++) {
        var fdGrp = fdG.add('group');
        var fd = lastFolders[i];
        
        var parentTxt = fdGrp['parentTxt'] = fdGrp.add('statictext {justify:"right"}');
        parentTxt.preferredSize.width = 150;
        parentTxt.text = fd.parent.displayName;
        parentTxt.alignment = 'center';

        var btn = fdGrp['btn'] = fdGrp.add("button {justify:'left'}");
        btn.preferredSize.width = 400;
        btn.text = fd.displayName;
        btn.justify ='left';
        
        if(get_file) {
            btn.onClick = browse_Helper_file(fd.fullName);
        } else {
            btn.onClick = select_helper (i);
        }

        if(!get_file) {
            var browseFolderBtn = fdGrp['browseFolderBtn'] = fdGrp.add("button", undefined,'Verzeichnis suchen');
            browseFolderBtn.onClick = browse_Helper_folder (fd.fullName);
        }
        if(get_file) {
            var browseFileBtn = fdGrp['browseFileBtn'] = fdGrp.add("button", undefined,'Datei suchen');
            browseFileBtn.onClick = browse_Helper_file (fd.fullName);
        }
    }

    var scrollBar = p.add("scrollbar");
    scrollBar.preferredSize.width = 50;
    scrollBar.stepdelta = 50;
    scrollBar.maximumSize.height = p.maximumSize.height;

    scrollBar.onChanging = function () {
        fdG.location.y = -1 * this.value;
    }

    win.onShow = function() {
        scrollBar.size = [20,p.size.height];
        scrollBar.location = [p.size.width-20, 0];
        scrollBar.maxvalue = fdG.size.height-p.size.height+20;
    };        
        
    if(win.show() != 2 && retval) {
        if(retval instanceof File) {
            add_to_recentFolders(retval.parent);
            return retval;
        }
        if(retval instanceof Folder) {
            add_to_recentFolders(retval);
            return retval;
        }
    } else {
        return null;
    }
};

function get_file () {
    return show_dialog(false, true);
}

function get_folder() {
    return show_dialog(true,false);
}

//~ show_dialog();

exports.show_dialog = show_dialog;
exports.get_file = get_file;
exports.get_folder = get_folder;
exports.add_to_recentFolders = add_to_recentFolders;