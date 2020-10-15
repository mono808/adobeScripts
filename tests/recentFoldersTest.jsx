//@include 'require.jsx'
$.level = 2;

function setup() {

}

function main(modjsx) {
    var m = require(modjsx);

    var result = m.show_dialog();
    
    $.writeln(result);
    $.writeln(result.constructor.name);
    
}

function tearDown () {

}

main('recentFolders');