//@include "require.js"

var _fp = require("_fp");

exports.main = function main(myArgs) {
    var docFile = myArgs.file;
    var doc = app.open(docFile);

    var response = {};
    response.width = doc.width.as("mm");
    response.height = doc.height.as("mm");

    var channels = _fp.make_array(doc.channels);
    response.colors = channels
        .filter(function (channel) {
            return channel.kind === ChannelType.SPOTCOLOR;
        })
        .filter(function (channel) {
            return channel.visible;
        })
        .map(function (channel) {
            return channel.name;
        });

    doc.close();

    return response;
};
