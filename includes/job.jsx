$.level = 1;

var rE = require('rE');
var lastFolders = require('lastFolders');
var names = require('names');

var nfo = {};

function set_nfo (ref, fullExtract, nachdruckMoeglich) {
    //try to get a reference to a job from the activeDocument
    if (!ref) {
        ref = get_ref();
    }

    if (ref == null) return null;

    //extract additional nfos from filename and folderstructure
    // var tempNfo = null;

    if (ref.constructor.name === 'Document') {
        try {
            ref = ref.fullName;
        } catch (e) {
            ref = get_ref();
            // var startFile = Folder($.getenv('csroot') + '/Kundendaten');
            // var saveFile = startFile.saveDlg ('Speicherort wählen');
            // //ref.saveAs(saveFile);
            // ref = saveFile;
        }
    }

    if (ref.constructor.name === 'File') {
        //this.nfo.file = ref;
        get_nfo_from_filename(ref);

        ref = ref.parent;
    }

    if (ref.constructor.name === 'Folder') {
        //this.nfo.folder = ref;
        get_nfo_from_filepath(ref);

    }


    if (!nfo.jobNr && nachdruckMoeglich) {
        nfo.jobNr = get_jobNr_from_user();
    } else {
        nfo.jobNr = nfo.refNr;
    }

    // if full infos are needed and some are still missing,
    // let the user choose manually
    if (fullExtract && (!nfo.printId || !nfo.tech || !nfo.jobName)) {
        get_nfo_from_user();
    }
    return nfo;
}

function get_ref() {
    // try to get a reference to a job from active documents or placed graphics
    var ref = null;
    var doc = null;
    try {
        doc = app.activeDocument
    } catch (e) {}

    if (doc) {
        switch (app.name) {
            case 'Adobe Illustrator':
                ref = get_ref_from_ai_doc(doc);
                break;

            case 'Adobe InDesign':
                ref = get_ref_from_indd_doc(doc);
                break;

            case 'Adobe Photoshop':
                ref = get_ref_from_ps_doc(doc);
                break;
        }
    }

    // if no reference is found, try the lastFolders
    if (!ref) {
        ref = lastFolders.show_dialog();
    }

    // try the old saveDialog if still no ref path
    if (!ref) {
        ref = File.saveDialog();
    }

    if (ref) {
        lastFolders.add(ref);
        return ref;
    }
}

function get_ref_from_indd_doc(doc) {
    // if no docs are visible, dont try to get a ref
    if (app.layoutWindows.length < 1) {
        return null
    }

    var ref = null;

    //close leftover docs without a layoutwindow
    var i, maxI, myDoc;
    for (i = 0, maxI = app.documents.length; i < maxI; i += 1) {
        myDoc = app.documents[i];
        if (myDoc.windows.length < 1) {
            myDoc.close(SaveOptions.NO);
        }
    }

    if (doc.name.match(rE.print)) {
        ref = doc;
    } else if (doc.allGraphics.length > 0) {
        try {
            var checkThis = doc.layers.item('motivEbene');
            var checkthis = checkThis.name;
            ref = new File(checkThis.allGraphics[0].properties.itemLink.filePath);
        } catch (e) {
            ref = doc;
        }
    } else if (doc.saved && rE.printTag.test(doc.filePath.fullName)) {
        ref = doc;
    }

    return ref;
}

function get_ref_from_ps_doc(doc) {
    var ref = null;

    try {
        var check = doc.fullName;
        if (rE.printTag.test(doc.name) || rE.jobNr.test(doc.path.fsName)) {
            ref = doc;
        } else {
            ref = null;
        }
    } catch (e) {
        ref = null;
    }
    return ref;
}

function get_ref_from_ai_doc(doc) {
    var ref = null;

    //check if ref has a jobStyle FileName
    if (doc.name.match(rE.printTag) || doc.name.match(rE.printTag2)) {
        ref = doc;

        //if not, check if placedGraphic has a jobStyle FileName (only if its on Motiv-Layer)
    } else if (doc.placedItems.length > 0) {
        var i = null,
            pI = null;
        for (i = 0; i < doc.placedItems.length; i++) {
            pI = doc.placedItems[i];
            if (pI.layer == doc.layers.getByName('Motiv')) {
                ref = doc.placedItems[0].file;
            }
        }

        //if not, check if the whole filepath contains a jobnumber
    } else if (rE.jobNr.test(doc.fullName)) {
        ref = doc;
    }

    return ref;
}

function get_nfo_from_filename(target) {

    if (target.constructor.name === 'File') {
        add_nfo('file', target);
    }

    var fileName = target.displayName;
    var match;

    match = fileName.match(rE.printTag)
    if (match) {
        add_nfo('printId', match[1]);
        add_nfo('wxh', match[2]);
        add_nfo('tech', match[3]);
    }

    match = fileName.match(rE.printTag2)
    if (match) {
        add_nfo('printId', match[1]);
        add_nfo('tech', match[3]);
    }

    match = fileName.match(rE.doc)
    if (match) {
        add_nfo('jobNr', match[1]);
        add_nfo('jobName', match[3]);
        add_nfo('doc', match[4]);
    }

    return nfo;
}

function get_nfo_from_filepath(fldr) {
    if (fldr.constructor.name === 'File') {
        fldr = fldr.parent
    };

    var jobFolder = get_jobBaseFolder(fldr);
    if (!jobFolder) return null;

    Folder.current = jobFolder;

    var match = jobFolder.displayName.match(rE.jobNameNew);
    match = match ? match : jobFolder.displayName.match(rE.jobNameOld);
    match = match ? match : jobFolder.displayName.match(rE.jobNr);

    add_nfo('refNr', match[1]);
    add_nfo('shop', match[2].indexOf('wm') != -1 ? 'wme' : 'cs');
    add_nfo('jobName', match[3] ? match[3] : undefined);
    add_nfo('folder', jobFolder);
    add_nfo('client', jobFolder.parent.displayName);
    add_nfo('c2b', jobFolder.parent.parent.displayName);

    return nfo;
}

function get_nfo_from_user() {
    var n = names;

    var techs = n.get_array('tech', true),
        ids = n.get_array('printId', true),
        jobNames = get_jobNames(nfo.folder);

    var win = new Window('dialog', 'monos Print Id Dialog');
    win.orientation = 'column';
    win.alignChildren = 'fill';

    win.pgrp = win.add('group', undefined, '');
    win.pgrp.orientation = 'row';
    win.pgrp.alignChildren = 'top';

    win.okgrp = win.add('group', undefined, '');
    win.okgrp.orientation = 'row';
    win.okgrp.alignChildren = 'fill';


    var helper = function (b) {
        return function (e) {
            if (this.value) {
                if (this.parent.text == 'Print_id') {
                    var value = f_all.validateString(this.parent.opts[b]);
                    add_nfo('printId', value, true);

                } else if (this.parent.text == 'Technique') {
                    var value = f_all.validateString(this.parent.opts[b]);
                    add_nfo('tech', value, true);

                } else if (this.parent.text == 'jobNames') {
                    var value = f_all.validateString(this.parent.opts[b]);
                    add_nfo('jobName', value, true);
                }
            }
        };
    };

    if (!nfo.printId) {
        ////////////////////////////////
        // add printId panel with radiobuttons and edittext
        win.pgrp.idpnl = win.pgrp.add('panel', undefined, 'Print_id');
        var idpnl = win.pgrp.idpnl;
        idpnl.alignChildren = 'fill';
        idpnl.opts = ids;

        for (var i = 0, maxI = ids.length; i < maxI; i += 1) {
            idpnl['rad_' + i] = idpnl.add("radiobutton", undefined, n.name('printId', ids[i]));

            if (nfo.printId == ids[i]) {
                idpnl['rad_' + i].value = true;
            }
            idpnl['rad_' + i].onClick = helper(i);
        };

        idpnl.newid = idpnl.add('edittext', undefined, 'Enter custom id:');
        idpnl.newid.onChange = function () {
            add_nfo('printId', this.text, true);
        }
    }

    if (!nfo.tech) {
        /////////////////////////////////7
        // add technique panel with radiobuttons
        win.pgrp.techpnl = win.pgrp.add('panel', undefined, 'Technique');
        var techpnl = win.pgrp.techpnl;
        techpnl.alignChildren = 'fill';
        techpnl.opts = techs;

        for (var i = 0, maxI = techs.length; i < maxI; i += 1) {
            techpnl['rad_' + i] = techpnl.add("radiobutton", undefined, n.name('tech', techs[i]));
            techpnl['rad_' + i].onClick = helper(i);
        };
    }

    if (!nfo.jobName) {
        /////////////////////////////////////
        // add jobName panel with radio buttons and edittext
        win.pgrp.jobNamepnl = win.pgrp.add('panel', undefined, 'jobNames');
        var jobNamepnl = win.pgrp.jobNamepnl;
        jobNamepnl.alignChildren = 'fill';
        jobNamepnl.opts = jobNames;

        for (var i = 0, maxI = jobNames.length; i < maxI; i += 1) {
            jobNamepnl['rad_' + i] = jobNamepnl.add("radiobutton", undefined, jobNames[i]);
            if (nfo.jobName == jobNames[i]) {
                jobNamepnl['rad_' + i].value = true;
            }
            jobNamepnl['rad_' + i].onClick = helper(i);
        };

        jobNamepnl.newjobName = jobNamepnl.add('edittext', undefined, 'New jobName:');
        jobNamepnl.newjobName.onChange = function () {
            add_nfo('jobName', this.text, true);
        }
    }

    /////////////////////////////////////
    // OK Cancel
    win.okgrp.yes = win.okgrp.add('button', undefined, 'Ok');
    win.okgrp.no = win.okgrp.add('button', undefined, 'Abbrechen');

    var i,
        maxI,
        item;

    win.okgrp.yes.onClick = function () {

        if (nfo.printId && nfo.tech && nfo.jobName) {
            win.close();
        } else {
            var alertString = ('Diese Info(s) fehlen:\n');
            alertString += !nfo.printId ? 'Druckposition\n' : '';
            alertString += !nfo.tech ? 'Druckverfahren\n' : '';
            alertString += !nfo.jobName ? 'JobName\n' : '';
            alertString += 'bitte auswählen!';
            alert(alertString);
            return;
        }
    };

    win.okgrp.no.onClick = function () {
        result = null;
        win.close();
    };

    win.show();

}

function get_jobBaseFolder(fld) {
    if (fld.displayName.match(rE.jobNr)) {
        return fld;
    } else if (fld.parent) {
        return get_jobBaseFolder(fld.parent);
    } else {
        return null;
    }
}

function get_jobNames(jobfolder) {
    var jobfolders = jobfolder.parent.getFiles(rE.jobNr);
    var jobNames = [];
    var jobName;

    for (var i = 0, maxI = jobfolders.length; i < maxI; i += 1) {
        var afolder = jobfolders[i];
        if (afolder instanceof Folder) {
            var fName = afolder.displayName;
            var match = fName.match(rE.jobNameNew);
            match = match ? match : fName.match(rE.jobNameOld);

            if (match && match.length > 3) {
                jobNames.push(match[3]);
            }
        }
    }
    return jobNames;
}

function get_jobNr_from_user() {

    var win = new Window('dialog', 'monos Print Id Dialog');
    win.orientation = 'column';
    win.alignChildren = 'fill';

    win.pgrp = win.add('group', undefined, '');
    win.pgrp.orientation = 'row';
    win.pgrp.alignChildren = 'top';

    win.okgrp = win.add('group', undefined, '');
    win.okgrp.orientation = 'row';
    win.okgrp.alignChildren = 'fill';

    /////////////////////////////////////
    // add jobNr panel with edittext
    win.pgrp.jobPnl = win.pgrp.add('panel', undefined, 'neue Auftragsnr erstellen?');
    win.pgrp.jobPnl.alignChildren = 'fill';

    win.pgrp.jobPnl.refNr = win.pgrp.jobPnl.add('statictext', undefined, 'Auftragsnr. des aktuellen Verzeichnis: ' + this.nfo.refNr);
    win.pgrp.jobPnl.jobNr = win.pgrp.jobPnl.add('edittext', undefined, 'neue Auftragsnr. hier eingeben');
    win.pgrp.jobPnl.jobNr.onChange = function () {
        add_nfo('jobNr', this.text, true);
    }

    /////////////////////////////////////
    // OK Cancel
    win.okgrp.yes = win.okgrp.add('button', undefined, 'Ok');
    win.okgrp.no = win.okgrp.add('button', undefined, 'Abbrechen');

    win.okgrp.yes.onClick = function () {

        if (win.pgrp.jobPnl.jobNr.text == 'neue Auftragsnr. hier eingeben') {
            add_nfo('jobNr', this.nfo.refNr, overwrite);
            win.close();
        } else if (rE.jobNr.test(win.pgrp.jobPnl.jobNr.text)) {
            add_nfo('jobNr', win.pgrp.jobPnl.jobNr.text, overwrite);
            win.close();
        } else {
            var alertString = 'Auftragsnr. ';
            alertString += win.pgrp.jobPnl.jobNr.text;
            alertString += ' ist fehlerhaft. Bitte prüfen!';
            alert(alertString);
            return;
        }
    };

    win.okgrp.no.onClick = function () {
        result = null;
        win.close();
    };

    win.show();

    return nfo.jobNr;
}

function add_nfo(key, value, overwrite) {
    if (!value) return;

    if (!nfo.hasOwnProperty(key)) {
        nfo[key] = value;
        return;
    }

    if (nfo.hasOwnProperty(key) && overwrite) {
        nfo[key] = value;
    }

    return;
}

exports.nfo = nfo;

exports.set_nfo = set_nfo;

/*
exports.get_wxh = function () {
    var w = null,
        h = null,
        doc = app.activeDocument;

    switch (app.name) {
        case 'Adobe Illustrator':
            w = new UnitValue(doc.width, 'pt');
            h = new UnitValue(doc.height, 'pt');
            nfo.wxh = w.as('mm').toFixed(0) + 'x' + h.as('mm').toFixed(0);
            break;
        case 'Adobe Photoshop':
            w = doc.width;
            h = doc.height;
            nfo.wxh = w.as('mm').toFixed(0) + 'x' + h.as('mm').toFixed(0);
            break;
    }
    return nfo.wxh;
};
 */
