function myStandListener(myEvent) 
{
    var sel = app.selection;
    if(sel.length != 0 && sel[0].constructor.name == 'Rectangle' && sel[0].itemLayer == app.activeDocument.layers.item('Prints')) 
    {
        //$.writeln(sel[0].constructor.name);
        var doc = app.activeDocument;
        var myPage = app.activeWindow.activePage;
        var l = doc.layers.item('Infos');            
        var myTF = l.name ? myPage.textFrames.item('printTableFrame') : null;
        try
        {
            if(myTF.name && myTF.tables.length > 0) 
            {
                #include '/c/capri-links/scripts/includes/Job.jsx'
                #include '/c/capri-links/scripts/includes/f_id_mock.jsx'
                #include '/c/capri-links/scripts/includes/rE.jsx'
                #include '/c/capri-links/scripts/includes/MonoNamer.jsx'
                #include '/c/capri-links/scripts/includes/MonoGraphic.jsx'
                var job = new Job(null, false);
                var monoGraphic = new MonoGraphic(sel[0].allGraphics[0]);
                f_id_mock.update_size_and_stand(myPage, [monoGraphic]);
            }
        } catch(e) {
            return;
        }
    }
}

myStandListener();