'use strict';
const isFunctionDefined = require('ezito-babel/utils/is-function-defined');
const isString = require('ezito-utils/public/is/string');
const getFunctionName = require('ezito-utils/public/object/get-fn-name');
const getProgram = require('ezito-babel/utils/get-program');
const makeError = require('ezito-utils/public/make-error');
const babelTypes = require('@babel/types');
const babel = require('@babel/core');

function insertFucntion (nodePath,template,types,fn,option = { insert : 'insertBefore'}){
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
    var program = getProgram(nodePath);
    var newFnTemplateemplate = '';
     
    if(!isFunctionDefined(nodePath, getFunctionName(fn))){
        babel.transformSync(isString(fn) ? fn : Function.prototype.toString.call(fn), {
            plugins : [
                [function(){
                    return {
                        visitor : {
                            FunctionDeclaration(path){
                                const { node } = path; 
                                var name =  node.id.name;
                                var params =  node.params; 
                                var body = babelTypes.blockStatement( node.body.body ) || node.body ; 
                                newFnTemplateemplate = babelTypes.functionDeclaration( 
                                    babelTypes.identifier(name),
                                    params, 
                                    body
                                );
                            }
                        }
                    }
                },]
            ]
        });
        if(babelTypes.isFunctionDeclaration(newFnTemplateemplate)){ 
            inserter.call(nodePath , newFnTemplateemplate);
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