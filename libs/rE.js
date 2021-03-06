/* 
function is_print (file) {
    var retval = false;

    if(rE.print_new.test(file.displayName)) {
        retval = true;
    } else if (rE.print.test(file.displayName)){
        retval = true;
    }
    return retval;
}
 */

// frequently used regular Expressions
var rE = {
    c2b: /^(B2C|B2B)$/i,
    digits_check: /(WME|ANG|CS|cn|A)\d\d-0\d\d/i,
    print: /([a-z0-9äüöß-]+)(_|-)([0-9]{1,3}x[0-9]{1,3})(_|-)(sd|flx|flo|dtax|dtak|dtg|stk|sub)\.[a-zA-Z]{2,3}$/i,
    printTag: /([a-z0-9äüöß-]+)(_|-)([0-9]{1,3}x[0-9]{1,3})(_|-)(sd|flx|flo|dtax|dtak|dtg|stk|sub)/i,
    printTag2: /([a-z0-9äüöß-]+)(_|-)(sd|flx|flo|dtax|dtak|dtg|stk|sub)(_|-)(working|print|preview|druck|entwurf)/i,
    print_full: /(\d{1,5}(wme|wm|ang|cs|cn|a)\d\d-0\d\d)(_|-)([a-z0-9äüöß-]+)(_|-)([a-z0-9äüöß-]+)/i,
    jobNr: /(\d{1,5}(wme|wm|ang|cs|cn|a)\d\d)(-0\d\d)?/i,
    jobNr2021: /^(\d{1,5}(wme|wm|ang|cs|cn|a)21)(-018)?/i,
    jobNrShort: /\d{1,5}(wme|wm|ang|cs|cn|a)\d\d/i,
    jobNrVeryShort: /\d{1,5}(W|A|C)/i,
    jobNameNew: /(\d{1,5}(wme|wm|ang|cs|cn|a)\d\d-0\d\d)_(.*)/i,
    jobNameOld: /(\d{1,5}(wme|wm|ang|cs|cn|a)\d\d-0\d\d)\s\((.*)\)/i,
    job_: /\d{1,5}(wme|wm|ang|cs|cn|a)\d\d-0\d\d_/i,
    doc: /(\d{1,5}(wme|wm|ang|cs|cn|a)\d\d-0\d\d)_([a-z0-9äüö-]+)_(ansicht|filmhuelle|film)/i
};

exports = module.exports = rE;
