function JobFolder (folder) {
    var jobRE = /\d{1,5}(wme|ang|cs|a)\d\d-0\d\d/i;
	var get_jobFolder = function (fld) {
	    if(fld.displayName.match(jobRE)) {
	        return fld;
	    } else if (fld.parent) {
	        return get_jobFolder(fld.parent);
	    } else {
	        return null;
	    }
	};
	var get_folder = function (folderName) {
		var myFolder = new Folder(base.fullName + '/' + folderName);
		if(!myFolder.exists) myFolder.create();
		return myFolder;
	};

	var get_monoPrints = function (fld) {
		var prints = fld.getFiles(is_print);
		var result = [];
		for (var i = 0; i < prints.length; i++) {
			var mP = new MonoPrint(prints[i], base);
			monoPrints.push(mP);
		}
	};

	var is_file = function (a) {
		return a instanceof File;
	};

	var is_folder = function (a) {
		return a instanceof Folder;
	};	

	var is_print = function (a) {
		if(!is_file(a)) return false;
		if(a.displayName.match(/film\.indd/i)) return false;
		return true;
	};

    var is_printFolder = function (a) {
        if(!is_folder(a)) return false;
        return (a.displayName.toLowerCase().indexOf('druckdaten') > -1);
    }

	var jobFolder = get_jobFolder(folder);
	var base = jobFolder ? jobFolder : folder;

	var printFolders = base.getFiles(is_printFolder);
	
	var monoPrints = [];
	for (var i = 0; i < printFolders.length; i++) {
		get_monoPrints(printFolders[i])
	}

	/* Public API
	------------------------------------------------------*/

	return {
		get_files : function (folderName) {
			var filesArray;
			if(subFolder.hasOwnProperty(folderName)) {
				filesArray = subFolders[folderName].getFiles(is_file);
			} else {			
				filesArray = [];
			}
			return filesArray;
		},

		get_prints : function () {
			return monoPrints;
		}
	}
}