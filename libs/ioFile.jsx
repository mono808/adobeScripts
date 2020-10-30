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
    aFile.close();
    var out = aFile.open('w', undefined, undefined);            
    aFile.encoding = "UTF-8";
    aFile.lineFeed = "Windows";
    var success = aFile.write(str);
    aFile.close();
    return success;
}