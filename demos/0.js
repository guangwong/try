var _ = require("underscore");
var UglifyJS = require("uglifyjs");
var JSONSelect = require("./0.JSONSelect");
var Mustache = require("mustache");


var cases = [
    {
        rule: ':has(:root > .TYPE:val("Call")) > .expression:has(:root > .TYPE:val("Dot")):has( :root > .expression > .name:val("S") ,  :root > .expression > .name:val("KISSY") ):has(:root > .property:val("namespace"))',
        message: "命中规则 [ S.namespace ] 在第 {{start.line}} 行的第 {{start.col}} 个字符。"
    },
    {
        rule: ':has(:root > .TYPE:val("Call")) > .expression:has(:root > .TYPE:val("Dot")):has( :root > .expression > .name:val("S") ,  :root > .expression > .name:val("KISSY") ):has(:root > .property:val("config"))',
        message: "命中规则 [ S.config ] 在第 {{start.line}} 行的第 {{start.col}} 个字符。"
    },
]

function getAst(codeStr) {
    return UglifyJS.parse(codeStr);
}

function analyze(codeStr) {

    var ast = getAst(codeStr);
    var ret = [];

    cases.forEach(function (oneCase) {
        var rule = oneCase.rule;
        var message = oneCase.message;
        var result = JSONSelect.match(rule, ast);
        if (result.length) {
            result.forEach(function (item) {
                ret.push(Mustache.render(message, item));
            });
        }
    });

    return ret;

}

///// Boot

var result = analyze([
    "KISSY.add(function(){",
    '    (1+1), S.namespace("xxx", {});',
    '    KISSY.namespace("xxx", {});',
    '    S.config({});',
    "});"
].join("\n"));

console.log(result.join("\n"));

// 输出结果如下：
// 命中规则 [ S.namespace ] 在第 2 行的第 11 个字符。
// 命中规则 [ S.namespace ] 在第 3 行的第 4 个字符。
// 命中规则 [ S.config ] 在第 4 行的第 4 个字符。