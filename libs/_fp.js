exports.make_array = function (collection) {
    var myArray = [];
    for (var index = 0; index < collection.length; index++) {
        var element = collection[index];
        myArray.push(element);
    }
    return myArray;
};

exports.modify_collection = function (collection, modify) {
    collection.forEach(function (elem) {
        modify(elem);
    });

    return collection;
};

exports.save_push = function (array, elem) {
    var newArray = array.slice(0);
    newArray.push(elem);
    return newArray;
};
