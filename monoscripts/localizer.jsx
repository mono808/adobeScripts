var kundenDaten,
    druckvorstufe;
    
if ($.getenv("COMPUTERNAME") === 'MONOTOWER') {        
    $.writeln('working at home');
    kundenDaten = '/e/Kundendaten';
    druckvorstufe = '/e/Druckvorstufe';
} else {
    $.writeln('working at CapriShirt');
    kundendaten = '//192.168.3.112/Kundendaten';
    druckvorstufe = '//192.168.3.112/Produktion/Druckvorstufe';
}
