var names = {
    printId : {
        lBrust   : 'linke Brust',
        rBrust   : 'rechte Brust',
        Front    : 'Vorderseite',
        Ruecken  : 'Rückseite',
        lArm     : 'linker Ärmel',
        bArm     : 'beide Ärmel',
        rArm     : 'rechter Ärmel',
        side     : 'seitlich',
        neckIn   : 'Nacken Innen',
        neckOut  : 'Nacken Außen',
        Beutel   : 'Tasche einseitig',
        BeutelAA : 'Tasche beidseitig',
        BeutelA  : 'Tasche Seite A',
        BeutelB  : 'Tasche Seite B'
    },

    color : {
        'Weiß1+2'  : 'Vordruck, Weiß',
        'UB+'      : 'Vordruck, Weiß',
        'UB+White' : 'Vordruck, Weiß',
        UL         : 'Vordruck',
        White      : 'Weiß',
        sisBlack   : 'Schwarz',
        Silber     : 'Silber 1, Silber 2',
        Gold       : 'Gold 1, Gold 2',
        Unterleger : 'Vordruck',
    },

    posOrder : {
        lBrust      : 1,
        rBrust      : 1,
        Brust       : 1,
        Front       : 1,
        Vorderseite : 1,
        lArm        : 1,
        bArm        : 1,
        Beutel      : 1,
        BeutelAA    : 1,
        BeutelA     : 1,
        rArm        : 2,
        Ruecken     : 2,
        Rücken      : 2,
        Rückseite   : 2,
        Rueckseite  : 2,            
        Nacken      : 2,
        neckIn      : 2,
        neckOut     : 2,
        Schulter    : 2,
        side        : 1,
        Back        : 2,
        BeutelB     : 2
    },

    side : {
        lBrust      : 'Front',
        rBrust      : 'Front',
        Brust       : 'Front',
        Front       : 'Front',
        Vorderseite : 'Front',
        lArm        : 'Front',
        rArm        : 'Back',
        bArm        : 'Front',
        side        : 'Front',
        Ruecken     : 'Back',
        Rücken      : 'Back',
        Rückseite   : 'Back',
        Rueckseite  : 'Back',            
        Nacken      : 'Back',
        neckIn      : 'Back',
        neckOut     : 'Back',
        Schulter    : 'Back',
        Back        : 'Back',
        Beutel      : 'Front',
        BeutelAA    : 'Front',
        BeutelA     : 'Front',
        BeutelB     : 'Back'
    },

    beutel : {
        XT001 : 'kurze Henkel',
        XT002 : 'kurze Henkel',
        XT003 : 'lange Henkel',
        XT004 : 'lange Henkel',
        WM101 : 'lange Henkel',
        WM110 : 'Turnbeutel',
        XT005 : 'ApoTasche'
    },

    tech : {
        SD   : 'Siebdruck',
        FLX  : 'Flexdruck',
        FLO  : 'Flockdruck',
        SUB  : 'Sublimation',
        DTAX : 'Digital-Flex',
        DTAO : 'Digital-Flock',
        DTG  : 'Digital-Direkt',
        STK  : 'Einstickung'
    },

    screenCount : {
        'UB+'               : 2,
        'Vordruck, Weiß'    : 2,
        'Silber'            : 2,
        'LiquidSilver'      : 2,
        'LiquidGold'        : 2,
        'Gold'              : 2,
        'UB+White'          : 2
    }
}

exports.get_array = function (topic, shortName) {
    if(names[topic]) {
        var a = [];
        var p = null;
        var topicNames = names[topic];
        for(p in topicNames) {
            if(topicNames.hasOwnProperty(p)) {
                a.push(shortName ? p : topicNames[p]);
            }
        }
        return a;
    }
    else {return null;}
};

exports.name = function (topic, strng) {
    if(names[topic] && names[topic].hasOwnProperty(strng)) {    
        return names[topic][strng];
    } else {
        return strng;
    }
};

exports.name_side = function (myString) {
    if (names.side.hasOwnProperty(myString)) {
        return names.side[myString];
    } else {
        return 'Front';
    }
};

exports.name_screens = function (myString) {
    if (names.screenCount.hasOwnProperty(myString)) {
        return names.screenCount[myString];
    } else {
        return 1
    }
};