﻿function get_primary_screen () {
    var screens = $.screens;    
    for (var i=0, len=screens.length; i < len ; i++) {
        if(screens[i].primary === true) {
        return screens[i]
        }
    }
}

function LastFolders () {
    var folders = [];
    var txt = new File('~/lastFolders.txt');
    var csroot = $.getenv("csroot");
    var jobRE = new RegExp(/\d{1,5}(wme|wm|ang|cs|a)\d\d-0\d\d/i);
    var screen = get_primary_screen();
    var maxFolder = (screen.bottom - screen.top)/38;
    
    return {

        add : function (ref) {
            // get the folder from these possible inputs (file|document|folder)
            var fd = this.get_folder_from_ref(ref);
            if(!fd) return null;
            // from a folder, get to the upstream jobFolder (the one with a jobNr)
            var jobFolder = this.get_jobFolder(fd);
            
            // if no jobFolder found, stick to the input
            fd = jobFolder ? jobFolder : fd;
            
            // check if this folder is already in the lastFolder
        	var idx = this.check_for_inclusion(fd);
            if(idx !== false) {                
                this.set_folder_to_top(idx);
            } else {            
                // if not included, add to the front of the array
                folders.unshift(fd);
                
                // remove the oldest folder if maximum is reached
                if(folders.length > maxFolder) {
                    folders.pop();
                }
            }
        
            // write the new lastFolders to hdd
            this.export_txt();
        },
    
        select_dialog : function (path) {
        	var fd = new Folder(path).selectDlg();
            if(fd.constructor.name == 'Folder') {
                this.add(fd);
            }
            return fd;
        },

        get_jobFolder : function (fld) {
            if(fld.displayName.match(jobRE)) {
                return fld;
            } else if (fld.parent) {
                return this.get_jobFolder(fld.parent);
            } else {
                return null;
            }
        },

        get_folder_from_ref : function (ref) {
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
        },

        check_for_inclusion : function (fd) {
            for (var i = 0; i < folders.length; i++) {
                var storedFolder = folders[i];
                if(encodeURI(fd.displayName) == encodeURI(storedFolder.displayName)) {
                    return i;
                }
            }
        	return false;
        },

        set_folder_to_top : function (idx) {
            if(idx >= 0 && idx < folders.length) {
                var fds = folders;
                var tmp = fds.splice(idx,1);
                fds.unshift(tmp[0]);
            }
            this.export_txt();
        },

        export_txt : function () {
            var str = folders.toSource();
            var success = this.write_file(txt, str);
            return success;
        },

        import_txt : function () {
            var str = this.read_file(txt);
            var ev = eval(str);
            if(ev instanceof Array && ev.length > 0) {
                folders = ev;
            }
        },

        read_file : function (aFile) {     
            if(aFile && aFile instanceof File) {
                aFile.open('r', undefined, undefined);
                aFile.encoding = "UTF-8";      
                aFile.lineFeed = "Windows";
                var success = aFile.read();
                aFile.close();
                return success;
            }
        },
   
        write_file : function (aFile, str) {
            aFile.close();
            var out = aFile.open('w', undefined, undefined);            
            aFile.encoding = "UTF-8";
            aFile.lineFeed = "Windows";
            var success = aFile.write(str);
            aFile.close();
            return success;
        },

        get_existing_folders : function (flds) {
            var existingFlds = [];
            for (var i = 0; i < flds.length; i++) {
                if(flds[i] instanceof Folder && flds[i].exists) {
                    existingFlds.push(flds[i]);
                }
            }
            return existingFlds;
        },

        show_dialog : function() {
            var retval;

            // only show folders that exist on the local setup
            var fds = this.get_existing_folders(folders);
           
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

            var win = new Window("dialog", "Extracted Infos",undefined, {resizeable:true});  // bounds = [left, top, right, bottom]
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

                var maxLength = fds.length < maxFolder ? fds.length : maxFolder;
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
                b2bBtn.onClick = function () {                    
                    retval = Folder(csroot + '/kundendaten/b2b').selectDlg('Select Job-Folder:');
                    win.close();
                }
                var b2cBtn = manualGrp.add("button", undefined, 'B2C');
                b2cBtn.preferredSize.width = 50;
                b2cBtn.onClick = function () {                    
                    retval = Folder(csroot + '/kundendaten/b2c').selectDlg('Select Job-Folder:');
                    win.close();
                }
                var angBtn = manualGrp.add("button", undefined, 'ANG');
                angBtn.preferredSize.width = 50;
                angBtn.onClick = function () {
                    retval = Folder(csroot + '/angebotedaten').selectDlg('Select Job-Folder:');
                    win.close();
                }
                var cancelBtn = manualGrp.add("button", undefined, 'Cancel');
                
            if(win.show() != 2 && retval && retval instanceof Folder) {
                this.add(retval);
                return retval;
                
            } else {
                return null;
            }
        }
    }
}