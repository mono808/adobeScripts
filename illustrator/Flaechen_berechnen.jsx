#target illustrator
function main (report) 
{

    
    #include 'Job.jsx'
    #include 'Pathmaker.jsx'
    #include 'SepAI.jsx'
    #include 'AreaDialog.jsx'

    //var job = new Job(null, true, false);
    
    //var pm = new Pathmaker();
    
    var sep = new SepAI(app.activeDocument);
    
    if(!sep.check()) return;
    
    //sort pathItems by spotcolor, putting them into indivdual "spot arrays"
    sep.sort_by_spotColor(sep.pathItems);

    sep.get_totalArea();
    
    var inkDialog = new AreaDialog(sep.spots, sep.totalArea).create_win().show();

}

main();