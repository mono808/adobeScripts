//@target illustrator
$.level = 1;

function main ()
{
    //@include 'require.jsx'

    var typeahead = require('typeahead');
    var pathmaker = require('pathmaker');
    
    function isFile(aFile) {
        return aFile.constructor.name === 'File';
    }

	var templates = pathmaker.folder('templates').getFiles(isFile);
	templates.sort();

    var filesToOpen = typeahead.show_dialog(templates, 'displayName');
 
    for (var i = 0; i < filesToOpen.length; i++) {
        app.open(filesToOpen[i]);
    }
}

main();
