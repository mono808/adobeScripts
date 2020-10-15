//@include 'require.jsx'


function setup() {

}

function main(modjsx) {
    var m = require(modjsx);

    alert(m.show_dialog());
    
}

function tearDown () {

}

main('lastFolders');