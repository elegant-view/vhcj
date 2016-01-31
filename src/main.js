var compile = require('./compile');
var split = require('./split');
module.exports = function (code, dirname) {
    return compile(split(code), dirname);
};
