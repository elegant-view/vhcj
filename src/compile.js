var babel = require('babel-core');

function compile(sourceObj) {
    var templateCode = sourceObj.template.code.replace(/\'/g, '\\\'').replace(/\n/g, '\\\n');
    return getStyleCode(sourceObj.style)
        .then(function (styleCode) {
            styleCode = sourceObj.style.code.replace(/\'/g, '\\\'').replace(/\n/g, '\\\n');
            var code = babel.transform(sourceObj.script.code, {
                presets: ['es2015'],
                plugins: ['transform-es2015-modules-amd']
            }).code;

            code = code.replace(/\}\);$/, '\n(' + insertCodeFn.toString() + ')(exports.default, \'' + templateCode + '\', \'' + styleCode + '\')\n});');

            return code;
        });
}

function getStyleCode(styleObj) {
    return new Promise(function (resolve, reject) {
        if (styleObj.type === 'text/css' || styleObj.type === 'css') {
            resolve(styleObj.code);
        }
        else if (styleObj.type === 'less') {
            require('less').render(styleObj.code, function (error, output) {
                if (error) {
                    return reject(error);
                }

                resolve(output);
            });
        }
        else if (styleObj.type === 'sass') {
            require('node-sass').render({
                data: styleObj.code
            }, function (error, result) {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
        }
        else {
            throw new Error('unsupported style type!');
        }
    });
}

function insertCodeFn(exportObj, template, style) {
    if (typeof exports.default === 'object') {
        exportObj.prototype.getTemplate === undefined && (exportObj.getTemplate = function () { return template; });
        exportObj.getStyle === undefined && (exportObj.getStyle = function () { return style; });
    }
}

module.exports = compile;
