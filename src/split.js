/**
 * @file 获取hcj文件中的各个块
 * @author yibuyisheng(yibuyisheng@163.com)
 */

/**
 * 拆分出style、template、script
 *
 * @param  {string} source 源代码
 * @return {Object}        {style: {code: '...', type: '...'}, template: {code: '...'}, script: {code: '...', type: ''}}
 */
function split(source) {
    var styleBlock = source.match(/<style(.*?)>([\s\S]*?)<\/style>/);
    if (styleBlock) {
        var styleType = styleBlock[1].match(/type="(.+)"/);
        styleBlock = {
            type: styleType ? styleType[1].toLowerCase() : 'text/css',
            code: styleBlock[2]
        };
    }

    var templateBlock = source.match(/<template(.*?)>([\s\S]*?)<\/template>/);
    if (templateBlock) {
        templateBlock = {
            code: templateBlock[2]
        };
    }

    var scriptBlock = source.match(/<script(.*?)>([\s\S]*?)<\/script>/);
    if (scriptBlock) {
        var scriptType = scriptBlock[1].match(/type="(.+)"/);
        scriptBlock = {
            type: scriptType ? scriptType[1].toLowerCase() : 'text/javascript',
            code: scriptBlock[2]
        };
    }

    return {
        style: styleBlock,
        template: templateBlock,
        script: scriptBlock
    };
}

module.exports = split;
