'use strict'; 
const getProgram = require('ezito-babel/utils/get-program');
const createfunctionTemplate = require('ezito-babel/utils/create-function-template');
const functionNameCreator = require('ezito-babel/utils/function-name-creator');
const isVariableDefined = require('ezito-babel/utils/is-variable-defined'); 
const { prepare : prepareAddSource } = require('ezito-babel/utils/add-source');
const { prepare : prepareAddImport } = require('ezito-babel/utils/import');
const { prepare : prepareInsertVariable } = require('ezito-babel/utils/insert-variable'); 
const { prepare : prepareInsertFunction } = require('ezito-babel/utils/insert-function');

const visitor = {
    create({ template , types : t },{opts}){
        const addSourceList = {
            list : [],
            add(source){  
                if(this.list.every( i=> i == source )) return ; 
                this.list.push( source );
            }, 
        };
        return {
            CallExpression ( nodePath , { opts  ,file }){  
                if( typeof opts !== 'object') return ;
                if(typeof opts.prepareCallFunction !== 'function') return;
                const fileName = file.opts.filename || opts.fileName; 
                const args = nodePath.node.arguments; 
                const type = nodePath.node.callee.type;
                const name = nodePath.node.callee.name;  
                let prepareResult = {};
                const prepare = opts.prepareCallFunction.call(nodePath, nodePath , fileName , {
                    addFunction : prepareInsertFunction(nodePath,template,t),
                    addSource   : prepareAddSource(nodePath,template,t),
                    addImport   : prepareAddImport(nodePath,t),
                    addVariable : prepareInsertVariable(nodePath,t),
                });

                if(typeof prepare !== 'object') return; 

                if( type === "Identifier" && name === "require"){ 
                    if(typeof prepare.Require === "function" ){
                        prepareResult = prepare.Require.call(nodePath , args[0].value /*module path*/, args , fileName) || {};
                    }
                }

                else if( type === 'Import' &&  name === undefined){
                    if(typeof prepare.Import === "function" ){  
                        prepareResult = prepare.Import.call(nodePath , args[0].value  /*module path*/,args) || {}; 
                    }
                }

                else if(type === 'MemberExpression'){
                    //console.log(nodePath.node.callee)
                    //t.callExpression(t.identifier( requireFunctionName || obj.name), obj.args )
                }
                
                else {
                    if( type === "Identifier" && typeof prepare[name] === 'function'){
                        prepareResult = prepare[name].call(nodePath , args) || {}; 
                    }
                }
            }
        }
    }
};


const argumantsBuidlre = function (args , types){ 
    if( types.arrayExpression) return types.arrayExpression(args)
}; 
const callExpression = function ({ Plugin , template , types : t } ,{opts}){  
    return { visitor : visitor.create({ Plugin , template , types : t } ,{opts}) }
};
callExpression.visitor = visitor;
module.exports = callExpression;