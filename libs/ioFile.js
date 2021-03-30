var ioFile = {};

ioFile.read_file = function (aFile) {
    if (aFile && aFile instanceof File && aFile.exists) {
        aFile.open("r", undefined, undefined);
        aFile.encoding = "UTF-8";
        aFile.lineFeed = "Windows";
        var success = aFile.read();
        aFile.close();
        return success;
    } else {
        alert(aFile + "could not be read");
    }
};

ioFile.write_file = function (aFile, str) {
    if (!(aFile instanceof File)) return false;

    aFile.close();

    if (!aFile.parent.exists) aFile.parent.create();

    var out = aFile.open("w", undefined, undefined);
    aFile.encoding = "UTF-8";
    aFile.lineFeed = "Windows";
    var success = aFile.write(str);
    aFile.close();
    return success;
};

ioFile.import_json = function (jsonFile) {
    if (!jsonFile.exists) {
        $.writeln("jsonFile " + jsonFile.displayName + " does not exist");
        return null;
    }

    var fileContent = this.read_file(jsonFile);
    var jsonObj = eval(fileContent);
    if (typeof jsonObj !== "object") return {};
    $.writeln("jsonFile " + jsonFile.displayName + "parsed");
    return jsonObj;
};

function find_files(dir, filter) {
    return find_files_sub(dir, [], filter);
}

function find_files_sub(dir, array, filter) {
    var f = Folder(dir).getFiles("*.*");
    for (var i = 0; i < f.length; i++) {
        if (f[i] instanceof Folder) find_files_sub(f[i], array, filter);
        else if (f[i] instanceof File && f[i].displayName.search(filter) > -1)
            array.push(f[i]);
    }
    return array;
}

ioFile.get_files = function (dir, filter) {
    var result = find_files(dir, filter);
    return result;
};

exports = module.exports = ioFile;
