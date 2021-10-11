function main(filePath) {
    var docFile = new File(filePath);
    var doc = app.open(docFile);

    var response = {};
    response.width = doc.width.as("mm");
    response.height = doc.height.as("mm");

    doc.close();

    return response;
}
