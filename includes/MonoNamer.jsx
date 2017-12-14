function MonoNamer () {
    this.printId = {
        lBrust   : 'linke Brust',
        rBrust   : 'rechte Brust',
        Front    : 'Vorderseite',
        Ruecken  : 'Rückseite',
        lArm     : 'linker Ärmel',
        rArm     : 'rechter Ärmel',
        neckIn   : 'Nacken Innen',
        neckOut  : 'Nacken Außen',
        Beutel   : 'Tasche einseitig',
        BeutelAA : 'Tasche beidseitig',
        BeutelA  : 'Tasche Seite A',
        BeutelB  : 'Tasche Seite B'
    };

    this.color = {
        'UB+White' : 'Vordruck, Weiß',
        UL         : 'Vordruck',    
        'UB+'      : 'Vordruck, Weiß',
        White      : 'Weiß',
        sisBlack   : 'Schwarz',
        Silber     : 'Silber 1, Silber 2',
        Gold       : 'Gold 1, Gold 2',
        Unterleger : 'Vordruck'
    };

    this.side = {
        lBrust      : 'Front',
        rBrust      : 'Front',
        Brust       : 'Front',
        Front       : 'Front',
        Vorderseite : 'Front',
        lArm        : 'Front',
        rArm        : 'Back',
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
    };

    this.beutel = {
        XT001 : 'kurze Henkel',
        XT002 : 'kurze Henkel',
        XT003 : 'lange Henkel',
        XT004 : 'lange Henkel',
        WM101 : 'lange Henkel',
        WM110 : 'Turnbeutel',
        XT005 : 'ApoTasche'
    };

    this.tech = {
        SD   : 'Siebdruck',
        FLX  : 'Flexdruck',
        FLK  : 'Flockdruck',
        SUB  : 'Sublimationsdruck',
        DTAX : 'Digital-Flexdruck',
        DTAK : 'Digital-Flockdruck',
        DTG  : 'Digital-Direktdruck',
        STK  : 'Bestickung'
    };

    this.screenCount = {
        'UB+'               : 2,
        'Vordruck, Weiß'    : 2,
        'Silber'            : 2,
        'LiquidSilver'      : 2,
        'LiquidGold'        : 2,
        'Gold'              : 2,
        'UB+White'          : 2
    };
};

MonoNamer.prototype.get_array = function (namerTag, shortName) {
    if(this.hasOwnProperty(namerTag)) {
        var a = [],
            p = null,
            namer = this[namerTag];
        for(p in namer) {
            if(namer.hasOwnProperty(p)) {
                a.push(shortName ? p : namer[p]);
            }
        }
        return a;
    }
    else {return null;}
};

MonoNamer.prototype.name = function (namer, strng) {
    if(this.hasOwnProperty(namer) && this[namer].hasOwnProperty(strng)) {    
        return this[namer][strng];
    } else {
        return strng;
    }
};

MonoNamer.prototype.name_side = function (myString) {
    if (this.side.hasOwnProperty(myString)) {
        return this.side[myString];
    } else {
        return 'Front';
    }
};

MonoNamer.prototype.name_screens = function (myString) {
    if (this.screenCount.hasOwnProperty(myString)) {
        return this.screenCount[myString];
    } else {
        return 1
    }
};