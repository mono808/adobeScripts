var kundenDaten = (function() {
    
    if ($.getenv("COMPUTERNAME") === 'MONOTOWER') {        
        $.writeln('working at home');
        return '/e/Kundendaten';
    } else {
        $.writeln('working at CapriShirt');
        return '//192.168.3.112/Kundendaten';
    }

}());

var druckvorstufe = (function() {
    
    if ($.getenv("COMPUTERNAME") === 'MONOTOWER') {        
        $.writeln('working at home');
        return '/e/Druckvorstufe';
    } else {
        $.writeln('working at CapriShirt');
        return '//192.168.3.112/Produktion/Druckvorstufe';
    }

}());

#include '/c/capri-links/druckvorstufe/Scripts/includes/augment_objects.jsx'
#include '/c/capri-links/druckvorstufe/Scripts/includes/func_crossapp.jsx'
#include '/c/capri-links/druckvorstufe/Scripts/includes/save_Options.jsx'
#include '/c/capri-links/druckvorstufe/Scripts/includes/files.jsx'
#include '/c/capri-links/druckvorstufe/Scripts/includes/refDoc_script.jsx'
#include '/c/capri-links/druckvorstufe/Scripts/includes/func_ai.jsx'
#include '/c/capri-links/druckvorstufe/Scripts/includes/func_ps.jsx'
#include '/c/capri-links/druckvorstufe/Scripts/includes/func_indd.jsx'

// #include '/e/Druckvorstufe/Scripts/includes/augment_objects.jsx'
// #include '/e/Druckvorstufe/Scripts/includes/func_crossapp.jsx'
// #include '/e/Druckvorstufe/Scripts/includes/save_Options.jsx'
// #include '/e/Druckvorstufe/Scripts/includes/files.jsx'
// #include '/e/Druckvorstufe/Scripts/includes/refDoc_script.jsx'
