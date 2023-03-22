 
'use strict'; 
const createFunctionTemplate = require('ezito-babel/utils/create-function-template');
const isVariableDefined = require('ezito-babel/utils/is-variable-defined');

module.exports = function ({ template , types : t } ,{opts}){
    return { 
        pre(state){  },
        visitor : { 
            Program(nodePath , { opts }) {
                let { node , scope } = nodePath;
                const functionDeclaration = createFunctionTemplate( t, nodePath , opts);
                for (const iterator of functionDeclaration) {
                    const { functionName , templateDeclaration } = iterator;
                    if(!templateDeclaration) continue ;
                    if(isVariableDefined(node , scope , functionName)) continue ;
                    nodePath.unshiftContainer("body",templateDeclaration)
                } 
            }, 
        },
    };
 

};