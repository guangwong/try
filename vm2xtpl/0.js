var VelocityJS = require("velocityjs");
var Parser = VelocityJS.Parser;
var FS = require("fs");
var _ = require("underscore");


var operatorMap = {
    "not": "!",
    "parenthesis" : "parenthesis",
    "==" : "===",
    "!=" : "!==",
    "&&" : "&&",
    "||" : "||"
};

var idMap = {
    "certResult" : "userinfo"
}

// ¥¶¿ÌvmµΩxtpl


function idTr(id){
    return idMap[id] || id;

}

function tr(node) {


    if (_.isArray(node) ) {
        var ret = node.map(function(sub, idx){
            var ret = tr(sub);
            if(
                sub.type  === "references"
                    && _.isString(node[idx-1])
                    && _.isString(node[idx+1])
            ){
                ret = "{{" + ret + "}}";
            }
            return ret;

        }).join("");
        if(node[0].type === "if"){ ret = ret + "{{/if}}" }
        return ret;
    }

    if (_.isArray(node)) {
        return node.map(function (item) {
            return tr(item);
        }).join("");
    }
    if (_.isString(node)) {
        return node;
    }

    if (node.type === "comment") {
        return "    {{!" + node.value.replace(/^##|\n|\r/g, "") + "}}";
    }

    if (node.type === "set") {
        return  "{{set(" + tr(node.equal[0]) + "=" + tr(node.equal[1]) + ")}}";
    }

    if (node.type === "property") {
        return idTr(node.id);
    }
    if (node.type === "method") {
        return idTr(node.id) + "(" + (node.args||[]).map(function(sub){
            return tr(sub);
        }).join(",") + ")";
    }
    if (node.type === "references") {
        if (node.path) {
            return idTr(node.id) + "." + node.path.map(function (node) {
                return tr(node);
            }).join(".");
        } else {
            return idTr(node.id);
        }
    }

    if (node.type === "math") {

        var operator = operatorMap[node.operator] || "OPERATOR_UNLNOWN [[" + node.operator + "]]";

        if (node.expression.length === 2) {
            return tr(node.expression[0]) + " " + operator + " " + tr(node.expression[1]);
        }
        if (node.expression.length === 1) {

            if(node.operator === "parenthesis"){
                return "(" + tr(node.expression[0]) + ")";
            }

            return operator + tr(node.expression[0]);

        }
    }

    if (node.type === "if") {
        return "{{#if (" + tr(node.condition) + ")}}";
    }

    if (node.type === "else") {
        return "{{else}}";
    }

    if (node.type === "elseif") {
        return "{{elseif ("+ tr(node.condition) +")}}";
    }

    if (node.type === "integer") {
        return node.value;
    }

    if (node.type === "string") {
        return '\'' + node.value + '\'';
    }

    return " [[[" + node.type + "]]] ";
}



var content = FS.readFileSync("./certResult.vm").toString();
var ast = Parser.parse(content);
var out = tr(ast);
FS.writeFileSync("0.xtpl", out);


