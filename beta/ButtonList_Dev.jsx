#target illustrator
function main ()
{
    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'Pathmaker.jsx'
    #include 'ButtonList.jsx'

    var pathmaker = new Pathmaker();
    function check_if_file(aFile) {
        return aFile.constructor.name === 'File';
    }

	var templates = pathmaker.folder('templates').getFiles(check_if_file);
	templates.sort();

    var buttonList = new ButtonList();
    var fileToOpen = buttonList.show_dialog(templates, 'displayName');
 
    app.open(fileToOpen);

}

main();
