#target illustrator
function main ()
{
    #include 'Pathmaker.jsx'
    #include 'Typeahead.jsx'

    var pathmaker = new Pathmaker();
    function check_if_file(aFile) {
        return aFile.constructor.name === 'File';
    }

	var templates = pathmaker.folder('templates').getFiles(check_if_file);
	templates.sort();

    var typeahead = new Typeahead();
    var filesToOpen = typeahead.show_dialog(templates, 'displayName');
 
    for (var i = 0; i < filesToOpen.length; i++) {
        app.open(filesToOpen[i]);
    }
}

main();
