var copyToClipboard = {
    copy : function (myString) {
        var myCmd = this._makeCommand(myString);

        //export cmd command string to a BAT
        var myBAT = this._saveBAT(myCmd);

        if (myBAT && myBAT.exists) {
            myBAT.execute();
        }
    },
    _makeCommand : function (string) {
        string = (typeof string === 'string') ? string : string.toString();
        var cmd = 'cmd.exe /c "echo ' + string + '|clip"';
        return cmd;
    },
    _saveBAT : function (saveThis) {
        try {
            var pathToClipboardDoc = "~/Documents/copyToClipboard.bat";
            var myDataLog = new File(pathToClipboardDoc);
            myDataLog.open("w");
            myDataLog.write(saveThis);
            myDataLog.close();
            return myDataLog;
        } catch (err) { return null }
    }
}

copyToClipboard.copy('spacko');
