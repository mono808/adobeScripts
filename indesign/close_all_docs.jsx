//@target indesign

for (var i = 0; i < app.documents.length; i++) {
	alert(app.documents[i].name + ' will be closed!');
	app.documents[i].close();
}