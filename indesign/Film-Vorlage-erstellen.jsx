#target indesign
function main () {

     
    #include 'MonoFilm.jsx'
   
    var monoFilm = new MonoFilm();
    
    try {
        app.applyWorkspace('Filme');
    } catch (e) {
        $.writeln('could not load workspace "Filme"');
    }

    monoFilm.create_template (false);

}
main();
