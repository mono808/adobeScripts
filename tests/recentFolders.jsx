//@include 'require.jsx'
$.level = 0;

function setup() {

}

function main(modjsx) {
    var m = require(modjsx);

    var myFolder = m.get_folder();
    //var myFile = m.get_file();
    
    //$.writeln('file ' + myFile);
    $.writeln('folder ' + myFolder);
    //$.writeln(result.constructor.name);
    
}

function tearDown () {

}

main('recentFolders');