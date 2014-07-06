var _ = require("underscore");
var UglifyJS = require("uglifyjs");
var JSONSelect = require("./0.JSONSelect");
var Mustache = require("mustache");


var cases = [
    {
        rule: ':has(:root > .TYPE:val("Call")) > .expression:has(:root > .TYPE:val("Dot")):has( :root > .expression > .name:val("S") ,  :root > .expression > .name:val("KISSY") ):has(:root > .property:val("namespace"))',
        message: "命中规则 S.namespace ！在第{{start.line}}行的第{{start.col}}个字符。"
    }
]

function getAst(codeStr) {
    return UglifyJS.parse(codeStr);
}

function analyze(codeStr) {

    var ast = getAst(codeStr);
    var ret = [];

    cases.forEach(function(oneCase){
        var rule = oneCase.rule;
        var message = oneCase.message;
        var result = JSONSelect.match(rule, ast);
        if(result.length){
            result.forEach(function(item){
                ret.push(Mustache.render(message, item));
            });
        }
    });

    return ret;

}

///// Boot

var result = analyze([
    '(1+1), S.namespace("xxx", {});',
    'KISSY.namespace("xxx", {});',
    'S.config({});'
].join("\n"));

console.log(result.join("\n"));

