function check_parent_folder (fsNode) {
    if(!fsNode.parent.exists) {
        fsNode.parent.create();
    }
}
        

exports.read_file = function (aFile) {     
    if(aFile && aFile instanceof File && aFile.exists) {
        aFile.open('r', undefined, undefined);
        aFile.encoding = "UTF-8";      
        aFile.lineFeed = "Windows";
        var success = aFile.read();
        aFile.close();
        return success;
    }
    else {
        alert(aFile + 'could not be read');
    }
}

exports.write_file = function(aFile, str) {
    if(!aFile instanceof File) 
        return false;    

    aFile.close();
    
    if(!aFile.parent.exists) 
        aFile.parent.create();

    var out = aFile.open('w', undefined, undefined);            
    aFile.encoding = "UTF-8";
    aFile.lineFeed = "Windows";
    var success = aFile.write(str);
    aFile.close();
    return success;
}