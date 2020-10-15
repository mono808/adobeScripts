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
        add(fd);
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

function set_folder_to_top (idx) {
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

function add (ref) {
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
        set_folder_to_top(index);
    } else {            
        // if not included, add to the front of the array
        lastFolders.unshift(fd);
        
        // remove the oldest folder if maximum is reached
        if(lastFolders.length > maxDialogRowes) {
            lastFolders.pop();
        }
    }

    // write the new recentFolders to hdd
    export_recentFolders();
};

function show_dialog () {
    var retval;
    var fds = lastFolders;
    
    function get_subfolders (fd) {
        var subs = fd.getFiles(function (fd) {return fd.constructor.name == 'Folder';});
        return subs;
    }
    
    function update_dropdown(drp, fd) {
        drp.removeAll();
        var subFds = get_subfolders (fd);
        for (var j = 0; j < subFds.length; j++) {
            drp.add("item",subFds[j].displayName);
        }
        drp.selection = 0;
    }

    function update_group(grpIdx, fd) {
        if(fd.parent) {
            fds[grpIdx] = fd;
            var fdGrp = fdPnl.grps[grpIdx];
            var upTxt = fdGrp['uptxt'];
            var upBtn = fdGrp['upbtn'];
            var btn = fdGrp['btn'];
            var drp = fdGrp['drp'];
        
            upTxt.text = fd.parent.displayName;
            upBtn.onClick = up_helper(grpIdx,fd.parent);
        
            btn.text = fd.displayName;
            btn.onClick = select_helper(grpIdx);
            
            var tmp = drp.onChange;
            drp.onChange = function () {};
            update_dropdown(drp, fd);
            drp.onChange = tmp;
        }
    }
    // bounds = [left, top, right, bottom]
    var win = new Window("dialog", "Extracted Infos",undefined, {resizeable:true});
    this.windowRef = win;

        var manualGrp = win[manualGrp] = win.add("group", undefined);
        var fdPnl = win[fdPnl] = win.add("panel", undefined);
        
        fdPnl.alignChildren = 'left';
        var grps = fdPnl.grps = [];

        var select_helper = function (i) {
            return function (e) {
                retval = fds[i];
                win.close();
            }
        };

        var up_helper = function (i, fd) {
            return function (e) {
                update_group(i, fd);
            }
        }

        var down_helper = function (grpIdx) {
            return function (e) {
                var drp = grps[grpIdx]['drp'];
                var subs = get_subfolders(fds[grpIdx]);
                var item = drp.selection;
                
                for (var i = 0; i < subs.length; i++) {
                    if(subs[i].displayName == item.text) {
                        update_group(grpIdx, subs[i]);
                        break;
                    }
                }
            }
        }
    
        var b2bHelper = function (buttonPath) {
            var path = csroot + buttonPath;
            return function () {
                retval = Folder(path).selectDlg('Select Job-Folder:');
                if(retval) {
                    add(retval);
                }
                win.close();
            }
        }

        var maxLength = fds.length < maxDialogRowes ? fds.length : maxDialogRowes;
        for (var i = 0; i < maxLength; i++) {
            var fdGrp = grps[i] = fdPnl.add('group');
            var fd = fds[i];
            
            var upTxt = fdGrp['uptxt'] = fdGrp.add('statictext {justify:"right"}');
            upTxt.preferredSize.width = 150;
            upTxt.text = fd.parent.displayName;
            upTxt.alignment = 'center';

            var upBtn = fdGrp['upbtn'] = fdGrp.add("button", undefined,'>>');
            upBtn.preferredSize.width = 40;
            upBtn.onClick = up_helper(i, fd.parent);

            var btn = fdGrp['btn'] = fdGrp.add("button {justify:'left'}");
            // var btn = fdGrp['btn'] = fdGrp.add("button", undefined,fd.displayName);
            btn.preferredSize.width = 400;
            btn.text = fd.displayName;
            btn.justify ='left';
            btn.onClick = select_helper (i);
            
            var dnBtn = fdGrp['dnBtn'] = fdGrp.add("button", undefined,'<<');
            dnBtn.preferredSize.width = 40;
            dnBtn.onClick = down_helper(i);
            
            var drp = fdGrp['drp'] = fdGrp.add("dropdownlist");
            drp.preferredSize.width = 170;
            update_dropdown (drp, fd);
            drp.onChange = down_helper(i);
        }
        
        var b2bBtn = manualGrp.add("button", undefined, 'B2B');
        b2bBtn.preferredSize.width = 50;                
        b2bBtn.onClick = b2bHelper('/kundendaten/b2b');
        
        var b2cBtn = manualGrp.add("button", undefined, 'B2C');
        b2cBtn.preferredSize.width = 50;
        b2cBtn.onClick = b2bHelper('/kundendaten/b2c');
        
        var angBtn = manualGrp.add("button", undefined, 'ANG');
        angBtn.preferredSize.width = 50;
        angBtn.onClick = b2bHelper('/angebotedaten');
        
        var cancelBtn = manualGrp.add("button", undefined, 'Cancel');
        
    if(win.show() != 2 && retval && retval instanceof Folder) {
        add(retval);
        return retval;
        
    } else {
        return null;
    }
};

//~ show_dialog();

exports.show_dialog = show_dialog;
exports.add = add;