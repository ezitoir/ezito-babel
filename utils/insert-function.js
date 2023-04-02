'use strict';
const isFunctionDefined = require('ezito-babel/utils/is-function-defined');  
const getFunctionName = require('ezito-utils/public/object/get-fn-name');
const getProgram = require('ezito-babel/utils/get-program');
const makeError = require('ezito-utils/public/make-error'); 
const functionToBabelNode = require('ezito-babel/utils/function-to-node');
const babelTypes = require('@babel/types'); 

function insertFucntion (nodePath,template,types,fn,option = { insert : 'unshiftContainer'}){
    var isProgramInsert = ['insertBefore','insertAfter'].includes(option.insert); 
    var program = getProgram(nodePath);
    var newFnTemplateemplate = '';
    var insertFn = {
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
    if(typeof insertFn[option.insert] === 'undefined') throw makeError(
        'INSERT-FN-ERROR',
        'option.insert must be of this some types [insertBefore,insertBefore,unshiftContainer,pushContainer]',
        1
    );
    var [ context , inserter ] = insertFn[option.insert];
     
    if(!isFunctionDefined(isProgramInsert ? nodePath : program , getFunctionName(fn))){ 
        newFnTemplateemplate = functionToBabelNode(fn)
        if(babelTypes.isFunctionDeclaration(newFnTemplateemplate)){  
            inserter(newFnTemplateemplate);
            return true;
        } 
    } 
    return false
}

module.exports.esModule = true;
module.exports.default = insertFucntion;
/**
 * 
 * @param {BabelNodePath} nodePath 
 * @param {BableTemplate} template 
 * @param {BabelTypes} types 
 * @param {Object} option 
 * @returns 
 */
module.exports.prepare = function (nodePath,template,types){
    /**
     * 
     */
    return function (fn , option){
        return insertFucntion(nodePath,template,types,fn,option)
    }
}