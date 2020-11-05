//@include 'require.jsx'


function setup() {

}

function main(modjsx) {
    var t = require(modjsx);
    var p1 = {
        name: 'jan',
        age : 39
    };
    var p2 = {
        name: 'jule',
        age: 38
    };
    var p3 = {
        name: 'paul',
        age: 2
    };

    var result = t.show_dialog([p1,p2,p3],'name',true);
    alert(result.toSource());
    

    

}

function tearDown () {

}

main('typeahead');