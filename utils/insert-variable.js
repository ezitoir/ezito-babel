'use strict';
const isVariableDefined = require('ezito-babel/utils/is-variable-defined') ;
const getProgram = require('ezito-babel/utils/get-program');
/**
 * 
 * @param {*} nodePath 
 * @param {*} types 
 * @param {*} kind 
 * @param {*} name 
 * @param {*} value 
 * @param {*} option = { insert : "insertBefore" || "insertAfter" , "pushContainer"}
 * @returns 
 */
module.exports.default = function insertVariable(nodePath, types,kind,name,value, option = { insert : 'insertBefore'}){
    if(isVariableDefined(nodePath.parentPath,name)) return;
    const template = value instanceof String ? types.stringLiteral : types.identifier;
    const program = getProgram(nodePath);
    value = value instanceof String ? value.toString() : value;
    const fn = {
        "insertBefore" : [
            types ,
            function(path){
                nodePath.insertBefore(path)
            }
        ],
        "insertAfter" : [
            types ,
            function(path){
                nodePath.insertAfter (path)
            }
        ],
        "unshiftContainer" : [
            program ,
            function(path){
                program.unshiftContainer('body' , path)
            }
        ],
        "pushContainer" : [
            program ,
            function(path){
                program.pushContainer('body' , path)
            }
        ],
    };
    const [ context , inserter ] = fn[option.insert]; 
    const newVar = types.variableDeclaration(kind,[
        types.variableDeclarator(
            types.identifier(name) ,
            template.call(types , value)
        )
    ]);
    inserter(newVar)
    nodePath.scope.bindings[name] = newVar;
};

module.exports.prepare = function (nodePath,types){
    return function (kind,name,value, option){
        module.exports.default(nodePath,types,kind,name,value,option);
    }
}