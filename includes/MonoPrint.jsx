function MonoPrint (aFile, baseFolder) {
	
	this.get_tag = function (aFile) {
	    var match = aFile.displayName.match(tagRegEx);
        if(!match) return aFile.displayName.substring(0, aFile.displayName.lastIndexOf ('.'));
	    var tag = this.id = match[1];
	    if(match[2]) tag += '_' + match[2];
	    if(match[3]) {
	    	tag += '_' + match[3];
	    	this.tech = match[3];
    	}
	    return tag;
	};

	this.get_tagged_files = function (folderName, myTag) {
		var folder = Folder (baseFolder.fullName + '/' + folderName)
		if(!folder.exists) return null;
		var result = folder.getFiles(myTag);
		if(result.length < 1) return null;
		return result[0];
	};

	this.get_working = function () {
		var tag = this.tag + '_Working.*';
		return this.jobFolder.working.getFiles(tag);
	};

	var baseFolder = baseFolder;
	var tagRegEx = /^([a-z0-9äüöß-]+)_(\d{1,3}x\d{1,3})?_?(SD|DTA|DTG|SUB|FLX|FLK|STK)_?(print|druck|sep|working|preview|film)?\.[a-z]{2,3}$/i;	
	
    this.tag = this.get_tag(aFile);
    var printsFolder = this.tech ? 'druckdaten-' + this.tech : 'druckdaten';

	this.print   = this.get_tagged_files(printsFolder, this.tag + '_*');
	this.preview = this.get_tagged_files('previews', this.tag+'_Preview.*');
	this.film    = this.get_tagged_files('druckdaten-sd', '*'+this.tag+'_Film.indd');
	this.working = this.get_tagged_files('working', this.tag+'_Working.*');
}