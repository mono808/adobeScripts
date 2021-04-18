rowContents = [
  
]

function show_wawi_string_dialog (rowContents, job) 
{
    var result = null;
    var dialogTitle;
    dialogTitle = "WaWi Infos nachtragen zu ->  ";
    dialogTitle += job ? job.nfo.jobNr + ' - ' + job.nfo.client : 'irgendeinem bekloppten Auftrag';

    var win = new Window ('dialog', dialogTitle);
    win.alignChildren = 'fill';
        var aPnl;
        for(var i = 0; i < rowContents.length; i++) {
            var rowContent = rowContents[i];
            var rowStrings = generate_wawi_strings(rowContent);
            aPnl = win.add('panel', undefined, '');
            aPnl.alignChildren = 'fill';
            aPnl.add('statictext', undefined, rowStrings.textil);
            aPnl.add('edittext', undefined, rowStrings.wawi);
            aPnl.add('button', undefined, 'CopyToClipboard');
        }
    
    win.add('button', undefined, 'Cancel');

    win.show();
}

