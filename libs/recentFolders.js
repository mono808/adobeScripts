var ioFile = require("ioFile");
var rE = require("rE");

var recentFoldersFile = new File("~/documents/adobeScripts/recentFolders.txt");

if (!recentFoldersFile.exists) {
    ioFile.write_file(recentFoldersFile, [].toSource());
}

var lastFolders = import_history(recentFoldersFile);
lastFolders = lastFolders.filter(function (fld) {
    return fld.exists;
});

var csroot = new Folder($.getenv("csroot")).fullName;
var screen = get_primary_screen();
// for (var i in screen) {
//     $.writeln("screen."+ i + " = " + screen[i]);
// };
var maxDialogRowes = 100;
var maxRecentFolders = 200;

function get_primary_screen() {
    var screens = $.screens;
    for (var i = 0, len = screens.length; i < len; i++) {
        if (screens[i].primary === true) {
            return screens[i];
        }
    }
}

function get_jobFolder(fld) {
    if (fld.displayName.match(rE.jobNr)) {
        return fld;
    } else if (fld.parent) {
        return get_jobFolder(fld.parent);
    } else {
        return null;
    }
}

function get_folder_from_ref(ref) {
    var fd;
    switch (ref.constructor.name) {
        case "File":
            fd = ref.parent;
            break;
        case "Document":
            if (ref.saved) {
                fd = ref.fullName.parent;
            } else {
                return null;
            }
            break;
        case "Folder":
            fd = ref;
    }
    return fd;
}

function move_to_top(idx) {
    if (idx >= 0 && idx < lastFolders.length) {
        var tmp = lastFolders.splice(idx, 1);
        lastFolders.unshift(tmp[0]);
    }
}

function export_history() {
    var paths = lastFolders.map(function (fd) {
        return fd.fullName;
    });
    var str = paths.toSource();
    var success = ioFile.write_file(recentFoldersFile, str);
    $.writeln("exported history to " + recentFoldersFile.displayName);
    return success;
}

function import_history() {
    var str = ioFile.read_file(recentFoldersFile);
    var ev = eval(str);
    if (ev instanceof Array && ev.length > 0) {
        ev = ev.map(function (path) {
            return new Folder(path);
        });
        return ev;
    } else {
        return [];
    }
}

function add_to_recentFolders(ref) {
    // get the folder from these possible inputs (file|document|folder)
    var fd = get_folder_from_ref(ref);
    if (!fd) return null;
    // from a folder, get to the upstream jobFolder (the one with a jobNr)
    var jobFolder = get_jobFolder(fd);

    // if no jobFolder found, stick to the input
    fd = jobFolder ? jobFolder : fd;

    // check if this folder is already in the lastFolder
    var index = lastFolders.findIndex(function (lF) {
        return lF.displayName == fd.displayName;
    });

    if (index > -1) {
        move_to_top(index);
    } else {
        // if not included, add to the front of the array
        lastFolders.unshift(fd);
    }

    if (lastFolders.length > maxRecentFolders) {
        lastFolders.pop();
    }

    export_history();
}

function remove_from_recentFolder(aFullName) {
    if (aFullName instanceof Folder) {
        aFullName = aFullName.fullName;
    }

    var result = lastFolders.filter(function (elem) {
        return elem.fullName !== aFullName;
    });

    $.writeln('removed "' + aFullName + '" from recentFiles');
    lastFolders = result;

    export_history();
}

function show_dialog(get_folder, get_file) {
    function select_helper(aFullName) {
        return function () {
            retval = new Folder(aFullName);
            win.close();
        };
    }

    function browse_Helper_folder(path) {
        return function () {
            var result = Folder(path).selectDlg("Select Job-Folder:");
            if (result) {
                retval = result;
                win.close();
            }
        };
    }

    function remove_helper(aFullName, row) {
        return function () {
            remove_from_recentFolder(aFullName);
            list.remove(row);
            list.layout.layout();
            //win.close();
        };
    }

    function browse_Helper_file(path) {
        return function () {
            var result = File(path).openDlg("Datei wählen");
            if (result) {
                retval = result;
                win.close();
            }
        };
    }

    var retval;

    // bounds = [left, top, right, bottom]
    var win = new Window("dialog", "Extracted Infos", undefined);
    this.windowRef = win;

    var p = win.add("panel", undefined);
    p.size = [800, screen.bottom * 0.65];

    var scrollBar = p.add("scrollbar");
    var list = p.add("group");
    list.margins = [0, 0, 15, 0];
    list.orientation = "column";
    list.alignment = "left";

    var maxLength =
        lastFolders.length < maxDialogRowes
            ? lastFolders.length
            : maxDialogRowes;
    for (var i = 0; i < maxLength; i++) {
        var row = list.add("group");
        var aFolder = lastFolders[i];

        var parentTxt = (row["parentTxt"] = row.add(
            'statictext {justify:"right"}'
        ));
        parentTxt.preferredSize.width = 150;
        parentTxt.text = aFolder.parent.displayName;
        parentTxt.alignment = "center";

        var btn = (row["btn"] = row.add("button {justify:'left'}"));
        btn.preferredSize.width = 400;
        btn.text = aFolder.displayName;
        btn.justify = "left";

        if (get_file) {
            btn.onClick = browse_Helper_file(aFolder.fullName);
        } else {
            btn.onClick = select_helper(aFolder.fullName);
        }

        if (!get_file) {
            var browseFolderBtn = (row["browseFolderBtn"] = row.add(
                "button",
                undefined,
                "Verzeichnis suchen"
            ));
            browseFolderBtn.onClick = browse_Helper_folder(aFolder.fullName);
        }
        if (get_file) {
            var browseFileBtn = (row["browseFileBtn"] = row.add(
                "button",
                undefined,
                "Datei suchen"
            ));
            browseFileBtn.onClick = browse_Helper_file(aFolder.fullName);
        }

        var removeBtn = row.add("button", undefined, "-");
        removeBtn.preferredSize.width = 25;
        removeBtn.onClick = remove_helper(aFolder.fullName, row);
    }
    scrollBar.preferredSize.width = 50;
    scrollBar.stepdelta = 50;
    scrollBar.maximumSize.height = p.maximumSize.height;

    scrollBar.onChanging = function () {
        list.location.y = -1 * this.value;
    };

    var manualGrp = (win[manualGrp] = win.add("group", undefined));

    var b2bBtn = manualGrp.add("button", undefined, "B2B");
    b2bBtn.preferredSize.width = 50;
    b2bBtn.onClick = browse_Helper_folder(csroot + "/kundendaten/b2b");

    var b2cBtn = manualGrp.add("button", undefined, "B2C");
    b2cBtn.preferredSize.width = 50;
    b2cBtn.onClick = browse_Helper_folder(csroot + "/kundendaten/b2c");

    var angBtn = manualGrp.add("button", undefined, "ANG");
    angBtn.preferredSize.width = 50;
    angBtn.onClick = browse_Helper_folder(csroot + "/angebotedaten");

    manualGrp.add("button", undefined, "Cancel");

    win.onShow = function () {
        scrollBar.size = [20, p.size.height];
        scrollBar.location = [p.size.width - 20, 0];
        scrollBar.maxvalue = list.size.height - p.size.height + 20;
    };

    if (win.show() != 2 && retval) {
        if (retval instanceof File) {
            add_to_recentFolders(retval.parent);
            return retval;
        }
        if (retval instanceof Folder) {
            add_to_recentFolders(retval);
            return retval;
        }
    } else {
        return null;
    }
}

function get_file() {
    return show_dialog(false, true);
}

function get_folder() {
    return show_dialog(true, false);
}

//~ show_dialog();

exports.show_dialog = show_dialog;
exports.get_file = get_file;
exports.get_folder = get_folder;
exports.add_to_recentFolders = add_to_recentFolders;
