'use strict'; 
const getProgram = require('ezito-babel/utils/get-program');
const createfunctionTemplate = require('ezito-babel/utils/create-function-template');
const functionNameCreator = require('ezito-babel/utils/function-name-creator');
const isVariableDefined = require('ezito-babel/utils/is-variable-defined');
const { prepare : prepareAddSource } = require('ezito-babel/utils/add-source');
const { prepare : prepareAddImport } = require('ezito-babel/utils/import');
const { prepare : prepareInsertVariable } = require('ezito-babel/utils/insert-variable');
const visitor = { 
    create({ template , types : t } ,{opts}){ 
        return { 
            FunctionDeclaration ( nodePath , { opts , file }){ 
                if(typeof opts !== 'object') return ;
                if(typeof opts.prepareFunctionDeclaration !== 'function') return;
                const declaration = nodePath.get('declaration'); 
                const fileName = file.opts.filename || opts.fileName; 
                const prepare = opts.prepareFunctionDeclaration.call(nodePath , nodePath , fileName ,{
                    addImport : prepareAddImport(nodePath,t),
                    addSource : prepareAddSource(nodePath ,template,t),
                    addVariable : prepareInsertVariable(nodePath,t),
                });
                if(typeof prepare !== "object") return ;
                const program = getProgram(nodePath );
                const { node , scope } = nodePath ;
                const { bindings , parent } = scope;
            },
            FunctionExpression(nodePath){
                //console.log(nodePath.parent.id)
            },
            ArrowFunctionExpression(){ 
            }
        }
    }
}
 

const functionDeclaration =  function ({ template , types : t } ,{opts}){  
    return { 
        pre(state){
            //state.scope
            //state.scope.globals
            //state.scope.plugins  
        },
        visitor : {
            ...visitor.create({ template , types : t },{opts}) ,
            Identifier ( nodePath , { opts }){ 
                let { node , scope } = nodePath;
                let { bindings, parent } = scope ;
                let specifiers = nodePath.get('specifiers');
                let declaration = nodePath.get('declaration');
                const { parent : decParent } = declaration ;  
                if(t.isCallExpression(declaration.parentPath.parentPath)){
                    if(t.isImport(declaration.parentPath.parentPath.node.callee)){
                        const args = declaration.parentPath.parentPath.node.arguments;
                        // declaration.parentPath.parentPath.replaceWith 
                    }
                } 
            }, 
        },
    };
};
functionDeclaration.visitor = visitor;
module.exports = functionDeclaration;