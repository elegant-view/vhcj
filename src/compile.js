var babel = require('babel-core');

function compile(sourceObj, dirname) {
    return getStyleCode(sourceObj.style, dirname)
        .then(function (styleCode) {
            var scriptCode = getScriptCode(sourceObj.script);
            var templateCode = getTemplateCode(sourceObj.template);
            return combine(styleCode, templateCode, scriptCode);
        });
}

function combine(styleCode, templateCode, scriptCode) {
    return scriptCode.replace(
        /\}\);$/,
        '\n('
            + insertCodeFn.toString()
            + ')(exports.default, \''
            + templateCode
            + '\', \''
            + styleCode + '\')\n});'
    );
}

function getScriptCode(scriptObj) {
    return babel.transform(scriptObj.code, {
        presets: ['es2015'],
        plugins: ['transform-es2015-modules-amd']
    }).code;
}

function getTemplateCode(templateObj) {
    if (!templateObj) {
        return '';
    }
    return templateObj.code.replace(/\'/g, '\\\'').replace(/\n/g, '\\\n');
}

function getStyleCode(styleObj, dirname) {
    return new Promise(function (resolve, reject) {
        if (!styleObj) {
            resolve('');
        }
        else if (styleObj.type === 'text/css' || styleObj.type === 'css') {
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
                data: styleObj.code,
                includePaths: dirname ? [dirname] : null
            }, function (error, result) {
                if (error) {
                    return reject(error);
                }
                resolve(result.css.toString());
            });
        }
        else {
            throw new Error('unsupported style type!');
        }
    }).then(function (code) {
        return code.replace(/\'/g, '\\\'').replace(/\n/g, '\\\n');
    });
}

function insertCodeFn(exportObj, template, style) {
    if (typeof exportObj === 'function') {
        !exportObj.prototype.hasOwnProperty('getTemplate')
            && (exportObj.prototype.getTemplate = function () { return template; });
        !exportObj.hasOwnProperty('getStyle')
            && (exportObj.getStyle = function () { return style; });
    }
}

module.exports = compile;
