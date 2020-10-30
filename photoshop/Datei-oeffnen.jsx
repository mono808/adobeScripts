//@target photoshop
//@include 'require.jsx'

(function () {
    var recentFolders = require('recentFolders');
    var myFile = recentFolders.show_dialog();
    if(myFile && myFile instanceof File && myFile.exists) {
        app.open(myFile)
    }
})();