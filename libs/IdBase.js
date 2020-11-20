var BaseDoc = require('BaseDoc');

function IdBase (initDoc) {
    BaseDoc.call(this,initDoc);
}

IdBase.prototype = Object.create(BaseDoc.prototype);
IdBase.prototype.constructor = IdBase;

exports = module.exports = IdBase;