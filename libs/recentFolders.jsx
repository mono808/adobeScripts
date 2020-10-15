var ioFile = require('ioFile');
var rE = require('rE');

var scriptDir = $.fileName.substring(0, $.fileName.lastIndexOf('/'));
var userName = $.getenv('USERNAME').replace('.', '').toLowerCase();
var recentFoldersFile = new File(scriptDir + '/recentFolders_' + userName + '.txt');

var lastFolders = import_recentFolders(recentFoldersFile);
lastFolders = lastFolders.filter(function(fld) {return fld.exists});

var csroot = (new Folder($.getenv("csroot"))).fullName;
var screen = get_primary_screen();
var maxDialogRowes = (screen.bottom - screen.top)/38;

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
    //export_recentFolders();
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
    
    if(lastFolders.length > maxDialogRowes) {
        lastFolders.pop();
    }

    export_recentFolders();
};

function show_dialog () {
    var retval;
    var fds = lastFolders;
    
    function get_subfolders (fd) {
        var subs = fd.getFiles(function (fd) {return fd.constructor.name == 'Folder';});
        return subs;
    }
    
    // bounds = [left, top, right, bottom]
    var win = new Window("dialog", "Extracted Infos",undefined, {resizeable:true});
    this.windowRef = win;

        var manualGrp = win[manualGrp] = win.add("group", undefined);
        var fdPnl = win[fdPnl] = win.add("panel", undefined);
        
        fdPnl.alignChildren = 'left';
        var grps = fdPnl.grps = [];

        var select_helper = function (i) {
            return function () {
                retval = fds[i];
                win.close();
            }
        };
   
        var browseHelper = function (path) {
            return function () {
                var result = Folder(path).selectDlg('Select Job-Folder:');
                if(result) {
                    retval = result;
                    //add_to_recentFolders(result);
                    win.close();
                }
            }
        }

        var maxLength = fds.length < maxDialogRowes ? fds.length : maxDialogRowes;
        for (var i = 0; i < maxLength; i++) {
            var fdGrp = grps[i] = fdPnl.add('group');
            var fd = fds[i];
            
            var parentTxt = fdGrp['parentTxt'] = fdGrp.add('statictext {justify:"right"}');
            parentTxt.preferredSize.width = 150;
            parentTxt.text = fd.parent.displayName;
            parentTxt.alignment = 'center';

            var btn = fdGrp['btn'] = fdGrp.add("button {justify:'left'}");
            // var btn = fdGrp['btn'] = fdGrp.add("button", undefined,fd.displayName);
            btn.preferredSize.width = 400;
            btn.text = fd.displayName;
            btn.justify ='left';
            btn.onClick = select_helper (i);
            
            var browseBtn = fdGrp['browseBtn'] = fdGrp.add("button", undefined,'Dateibrowser hier');
            //browseBtn.preferredSize.width = 100;
            browseBtn.onClick = browseHelper (fd.fullName);
        }
        
        var b2bBtn = manualGrp.add("button", undefined, 'B2B');
        b2bBtn.preferredSize.width = 50;                
        b2bBtn.onClick = browseHelper(csroot + '/kundendaten/b2b');
        
        var b2cBtn = manualGrp.add("button", undefined, 'B2C');
        b2cBtn.preferredSize.width = 50;
        b2cBtn.onClick = browseHelper(csroot + '/kundendaten/b2c');
        
        var angBtn = manualGrp.add("button", undefined, 'ANG');
        angBtn.preferredSize.width = 50;
        angBtn.onClick = browseHelper(csroot + '/angebotedaten');
        
        var cancelBtn = manualGrp.add("button", undefined, 'Cancel');
        
    if(win.show() != 2 && retval && retval instanceof Folder) {
        add_to_recentFolders(retval);
        return retval;
        
    } else {
        return null;
    }
};

//~ show_dialog();

exports.show_dialog = show_dialog;
exports.add_to_recentFolders = add_to_recentFolders;