#target indesign

function main () {    
    
    #include '/c/repos/adobeScripts1/includes/UBTester.jsxinc'
    
    var doc = app.activeDocument;
    var ubTester = new UBTester(doc);
    ubTester.add_tester();
    
}

main();