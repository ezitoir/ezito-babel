'use strict';  
const makeError = require('ezito-utils/public/make-error');
const babelTypes = require('@babel/types');
const babel = require('@babel/core'); 
const isFunction = require('ezito-utils/public/is/function');
const isArrowFunction = require('ezito-utils/public/is/arrow-function'); 
const isAsyncFunction = require('ezito-utils/public/is/async-function');
const isAnonymousfunction = require('ezito-utils/public/is/anonymous-function');
 
function parseFunction (fnBlockString){ 
    var newFnTemplateemplate = {
        name : '',
        params : [],
        body : []
    }; 
    babel.transformSync(fnBlockString, {
        plugins : [
            [function(){
                return {
                    visitor : {
                        FunctionDeclaration(path){
                            const { node } = path; 
                            var name =  node.id.name;
                            var params =  node.params;  
                            var body = babelTypes.blockStatement( node.body.body ) || node.body ;
                            newFnTemplateemplate.name = babelTypes.identifier(name);
                            newFnTemplateemplate.params = params;
                            newFnTemplateemplate.body = body 
                        }, 
                    }
                }
            },]
        ]
    });
    return newFnTemplateemplate;
};
function parseVariableDeclator(fnBlockString){
    var newFnTemplateemplate = {
        name : '',
        params : [],
        body : []
    };  
    
    babel.transformSync(fnBlockString, {
        plugins : [
            [function(){
                return {
                    visitor : {
                        ArrowFunctionExpression(path){
                            const { node } = path;  
                            var params =  node.params;  
                            var body = babelTypes.blockStatement( node.body.body ) || node.body ;  
                            newFnTemplateemplate.params = params;
                            newFnTemplateemplate.body = body 
                        }, 
                    }
                }
            },]
        ]
    });
    return newFnTemplateemplate;
}
function functionToBabelNode(fn){
    if(!isFunction(fn)) throw makeError(
        '[PARAM-TYPE-ERROR]',
        'fn param must be have string or function type',
        1
    );
    var fnBlockString = '';
    var newFnTemplateemplate = {};
    if(isFunction(fn)){ 
        fnBlockString = Function.prototype.toString.call(fn);
        if(isAnonymousfunction(fn)){  
            fnBlockString = fnBlockString.replace('function','function _name');
            newFnTemplateemplate = parseFunction(fnBlockString);
            newFnTemplateemplate = babelTypes.functionExpression(
                null ,
                newFnTemplateemplate.params ,
                newFnTemplateemplate.body , 
                isAsyncFunction(fn)
            );
            if(babelTypes.isFunctionExpression(newFnTemplateemplate)){  
                return newFnTemplateemplate;
            } 
        }
        if(isArrowFunction(fn)){
            fnBlockString = 'const test = ' + fnBlockString;
            newFnTemplateemplate = parseVariableDeclator(fnBlockString);
            newFnTemplateemplate = babelTypes.arrowFunctionExpression( 
                newFnTemplateemplate.params ,
                newFnTemplateemplate.body , 
                isAsyncFunction(fn)
            );
            if(babelTypes.isArrowFunctionExpression(newFnTemplateemplate)){  
                return newFnTemplateemplate;
            } 
        }

        newFnTemplateemplate = parseFunction(fnBlockString);
        newFnTemplateemplate = babelTypes.functionDeclaration(
            newFnTemplateemplate.name ,
            newFnTemplateemplate.params ,
            newFnTemplateemplate.body , 
            isAsyncFunction(fn)
        );
        if(babelTypes.isFunctionDeclaration(newFnTemplateemplate)){  
            return newFnTemplateemplate;
        } 
    } 
    return false;
}
module.exports = functionToBabelNode;
module.exports.__esModule = true;
module.exports['default'] = module.exports;