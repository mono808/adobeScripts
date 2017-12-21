#target indesign
function main () {

    #includepath '/c/repos/adobeScripts1/includes/'
    #include 'MonoFilm.jsx'
   
    var monoFilm = new MonoFilm();

    monoFilm.create_template (false);

}
main();