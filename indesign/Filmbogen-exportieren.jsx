#target indesign

function main() {

     
    #include 'augment_objects.jsx'
    #include 'f_all.jsx'
    #include 'f_id.jsx'
    #include 'Pathmaker.jsx'
    #include 'rE.jsx'

    var myDoc = app.activeDocument;
    var myWin = myDoc.layoutWindows.item(0);
    var pm = new Pathmaker();

    //collect of fileNames of placed PDFs for nameing the output file accordingly
    function collect_placed_pdfs () {
        var i,maxI, myGraphic, linkedPdfs = [], pdfPath;
        
        for (i = 0, maxI = myDoc.allGraphics.length; i < maxI; i+=1) 
        {
            myGraphic = myDoc.allGraphics[i];
            pdfPath = decodeURI(myGraphic.properties.itemLink.filePath);
            if(!linkedPdfs.includes(pdfPath)) {
                linkedPdfs.push(pdfPath);    
            }
        }
        return linkedPdfs;
    }

    function generate_array_of_pdf_names(pdfs) {
        var i, maxI, pdf, tempRegEx, namesArray = [], pdfName, shorty;

        for (i = 0, maxI = pdfs.length; i < maxI; i+=1) 
        {
            pdf = pdfs[i];
            var filename = pdf.split('\\').pop();
            var jobNrResults = rE.jobNrShort.exec(filename);
            if(jobNrResults && jobNrResults.length > 0) {
                pdfName = jobNrResults[0];
                pdfName = rE.jobNrVeryShort.exec(pdfName)[0];
            } else { 
                pdfName = filename.substring(0, filename.lastIndexOf ('.'));
            }           
            
            tempRegEx = new RegExp(String(pdfName));
            if(!tempRegEx.test(namesArray)) {
                namesArray.push(pdfName);
            };
        }
        return namesArray;
    }

    function remove_pdfs (pdfs) {
        var pcroot = new Folder($.getenv('pcroot'));
        var removedCounter = 0,
            filmOutRE = new RegExp(f_all.escapeRegExp(pcroot + '/distiller/filme/out'), 'i');

        var i, pdf, pdfFile;
            
        for (i = 0; i < pdfs.length; i++) {
            pdf = pdfs[i];
            pdfFile = new File(pdf);
            if(pdfFile.exists && (filmOutRE.test(pdfFile.path))) {
                f_all.copy_file_via_bridgeTalk(pdf, saveFolder, true);
                removedCounter += 1;
            }
        }
        alert(removedCounter + ' Film.pdfs wurden entfernt');
    }

    var myPage,
        i = myDoc.pages.length-1;
    do
    {
        myPage = myDoc.pages[i];
        if(myPage.pageItems.length > 0) {
            f_id.fitPageWidth2Art(myPage);
        } else {
            myPage.remove();
        }
    } while(i--);

    var linkedPdfs = collect_placed_pdfs();
    var namesArray = generate_array_of_pdf_names(linkedPdfs);

	var saveName = namesArray.join('_');

    var psFolder = pm.folder('rolleIn');
    var psFile =   new File(psFolder.fullName  + '/' + saveName + '.ps');
    
    var saveFolder = pm.folder('rolleSaved');
    var saveFile = new File(saveFolder.fullName + '/' + saveName + '.indd');
    
    f_all.saveFile(saveFile, undefined, false);
    

    f_id.print2PS(psFile, 'monoRolle');

        
    myDoc.close();
    $.sleep(0000);
    if(Window.confirm('Verwendete Film-PDFs aus dem Output-Ordner entfernen?')) {
        remove_pdfs(linkedPdfs);
    }
}

function check() {
    if(app.documents.length > 0 && app.activeDocument) {
        return true;
    } else {
        return false;
    }
}

if(check()){
    main();
} else {
    alert('Erst Filmrolle erstellen bitteeeschön');   
}


