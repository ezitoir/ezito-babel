'use strict';
const isDefined = require('ezito-babel/utils/is-define');
function has(name){  
    return name === this.toString() 
}
module.exports = function isVariableDefined(nodePath , varName) { 
    const { node , scope } = nodePath;  
    function isLocalDefined( node , { bindings , parent } , name){
        let variables = Object.keys(bindings);
 
        if(variables.indexOf(name) > -1){
            return true;
        }
        if (variables.some(has, name )) return true;  
        return parent ? isLocalDefined(node,parent,name) : false;
    };  
   var locDef = isLocalDefined( node , scope , varName); 
   var isDef = isDefined(nodePath , varName , 'variable');
   return !locDef && !isDef ? false : true;
}
