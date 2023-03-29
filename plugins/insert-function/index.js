 
'use strict';  
const { prepare : prepareAddSource } = require('ezito-babel/utils/add-source');
const { prepare : prepareAddImport } = require('ezito-babel/utils/import');
const { prepare : prepareInsertVariable } = require('ezito-babel/utils/insert-variable');
const { prepare : prepareInsertFunction } = require('ezito-babel/utils/insert-function');
const ezitoTypes = require('ezito-utils/public/validators/types'); 

module.exports = function ({ template , types : t } ,{opts}){
    return { 
        pre(state){  }, 
        visitor : { 
            Program(nodePath , { opts ,file}) {
                if(!ezitoTypes.object(opts)) return ;
                if(!ezitoTypes.function(opts.prepareInsertFunction)) return; 
                if(!ezitoTypes.oneOfType(ezitoTypes.string,ezitoTypes.undefined)(opts.fileName)) return;
                var fileName = file.opts.filename || opts.fileName;
                var resultPrepareInsertFunction = opts.prepareInsertFunction.call(nodePath , nodePath , fileName ,{
                    addFunction : prepareInsertFunction(nodePath,template,t),
                    addImport   : prepareAddImport(nodePath,t),
                    addSource   : prepareAddSource(nodePath ,template,t),
                    addVariable : prepareInsertVariable(nodePath,t),
                });
                if(!(ezitoTypes.function( resultPrepareInsertFunction) || ezitoTypes.array(resultPrepareInsertFunction,[ezitoTypes.oneOfType(ezitoTypes.string,ezitoTypes.function)]) || ezitoTypes.string(resultPrepareInsertFunction))) return;
                
                if(ezitoTypes.function( resultPrepareInsertFunction)){
                    prepareInsertFunction(nodePath,template,t)(resultPrepareInsertFunction,{insert:'unshiftContainer'})
                }
                if(ezitoTypes.array(resultPrepareInsertFunction)){
                    for (const iterator of resultPrepareInsertFunction) {
                        prepareInsertFunction(nodePath,template,t)(iterator , {insert:'unshiftContainer'})
                    }
                }
            }
        }, 
    };
};