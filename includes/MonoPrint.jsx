function MonoPrint (aFile, baseFolder) {
	
	var get_tag = function (aFile) {
	    var match = aFile.displayName.match(tagRegEx);
        if(!match) return aFile.displayName.substring(0, aFile.displayName.lastIndexOf ('.'));
	    var tag = mP.id = match[1];
	    if(match[2]) tag += '_' + match[2];
	    if(match[3]) {
	    	tag += '_' + match[3];
	    	mP.tech = match[3];
    	}
	    return tag;
	};

	var get_tagged_files = function (folderName, myTag) {
		var folder = Folder (baseFolder.fullName + '/' + folderName)
		if(!folder.exists) return null;
		var result = folder.getFiles(myTag);
		if(result.length < 1) return null;
		return result[0];
	};

	var get_working = function () {
		var tag = this.tag + '_Working.*';
		return this.jobFolder.working.getFiles(tag);
	};

	var baseFolder = baseFolder;
	var tagRegEx = /^([a-z0-9äüöß-]+)_(\d{1,3}x\d{1,3})?_?(SD|DTA|DTG|SUB|FLX|FLK|STK)_?(print|druck|sep|working|preview|film)?\.[a-z]{2,3}$/i;	
	
	var mP = {};
    mP.tag = get_tag(aFile);
    var printsFolder = mP.tech ? 'druckdaten-' + mP.tech : 'druckdaten';

	mP.print   = get_tagged_files(printsFolder, mP.tag + '_*');
	mP.preview = get_tagged_files('previews', mP.tag+'_Preview.*');
	mP.film    = get_tagged_files('druckdaten-sd', '*'+mP.tag+'_Film.indd');
	mP.working = get_tagged_files('working', mP.tag+'_Working.*');

	/*
	---------------------------------------------------*/
	return mP;
}