// if exists
// if not -> attach a counter with 01
// if counter present, increment and replace
    
// return newFilename
var init_counter(fileName) {

}

const getUniqueName = (filePath) => {
    //check if file exists
    // if not, return filename
    if(!File(filePath).exists) return fileName;
    
    
    var regExCounter = new RegExp(/(.*)-(\d\d)\.(ai|psd|indd|pdf|tif|jpg)$/);
    var match = regExCounter.match(fileName);
    if(!match) return '';
    // check if filename contains a counter already
    var num = 0;
    var myFile = File (filePath)
    while(myFile.exists) {
        var tokens = myFile.displayName.split('.');
        var ext = '.' + tokens.pop();
        var fileName = tokens.join('.');
    }

     // make any pattern here
    newFileName = fileName + "-V" + index + ext;
   
}

int num = 0;
String save = at.getText().toString() + ".jpg";
File file = new File(myDir, save);
while(file.exists()) {
    save = at.getText().toString() + (num++) +".jpg";
    file = new File(myDir, save); 
}

function getFileIndex (fileName) {
    
    

}