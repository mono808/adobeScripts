#target illustrator
function main ()
{
    #includepath '/c/capri-links/scripts/includes'
    #include 'f_all.jsx'
    #include 'mofo.jsx'
    #include 'save_Options.jsx'

    function check_if_file(aFile) {
        return aFile.constructor.name === 'File';
    }

	var templates = Folder(mofo.templates).getFiles(check_if_file);
	templates.sort();

    var fileToOpen = f_all.choose_from_array(templates, 'displayName');
	
    app.open(fileToOpen);
}

function check()
{
    return true;
}

if(check())
{
    main();
}