// frequently used regular Expressions
var rE = {
    c2b    :        /^(B2C|B2B)$/i,
    digits_check:   /(WME|ANG|CS|A)\d\d-0\d\d/i,
    //print_new:      /[a-z0-9äüö]+_[a-z0-9äöü]+_(sep|flx|flk|dta|dtg|stk|sub)/i,
    print:          /([a-z0-9äüöß-]+)_([0-9]{1,3}x[0-9]{1,3})_(sd|flx|flk|dta|dtg|stk|sub)\.[a-zA-Z]{2,3}$/i,
    printTag :      /([a-z0-9äüöß-]+)_([0-9]{1,3}x[0-9]{1,3})_(sd|flx|flk|dta|dtg|stk|sub)/i,
    printTag2 :     /([a-z0-9äüöß-]+)_(sd|flx|flk|dta|dtg|stk|sub)_(working|print|preview|druck|entwurf)/i,
    print_full:     /(\d{1,5}(wme|ang|cs|a)\d\d-0\d\d)_([a-z0-9äüöß-]+)_([a-z0-9äüöß-]+)/i,
    jobNr:          /\d{1,5}(wme|ang|cs|a)\d\d-0\d\d/i,
    jobNrShort :    /\d{1,5}(wme|ang|cs|a)\d\d/i,
    jobNrVeryShort: /\d{1,5}(W|A|C)/i,
    jobNameNew:     /(\d{1,5}(wme|ang|cs|a)\d\d-0\d\d)_(.*)/i,
    jobNameOld :    /(\d{1,5}(wme|ang|cs|a)\d\d-0\d\d)\s\((.*)\)/i,
    job_:           /\d{1,5}(wme|ang|cs|a)\d\d-0\d\d_/i,
    doc :           /(\d{1,5}(wme|ang|cs|a)\d\d-0\d\d)_([a-z0-9äüö-]+)_(ansicht|filmhuelle|film)/i,


    is_print : function (file) {
        var retval = false;

        if(rE.print_new.test(file.displayName)) {
            retval = true;
        } else if (rE.print.test(file.displayName)){
            retval = true;
        }
        return retval;
    },
};