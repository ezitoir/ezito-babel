'use strict';
const ezitoTypes = require('ezito-utils/public/validators/types');
const makeError = require('ezito-utils/public/make-error');

function getType(nodePath , option = { listTypes : [], endCheck : '', is : {}}){ 
    if(!ezitoTypes.object(option)) throw makeError(
        '[PARAM-TYPE-ERRRO]' ,
        '',
        1
    );
    
    if(nodePath.scope.block.type){  
        if(option.listTypes && option.listTypes.includes(nodePath.scope.block.type)){ 
            if(option.is && typeof option.is[nodePath.scope.block.type] === "function"){
                if(!option.is[nodePath.scope.block.type].call(this,nodePath.scope.path.parentPath.type)) return false;  
            }   
            return getType(nodePath.scope.path.parentPath , option);
        }
        else {   
            if(nodePath.scope.block.type === option.endCheck) return true;
        }
    } 
    return false;
}

function getScopeType (nodePath ,option){ 
    var is = getType(nodePath , option );
    if(is) return is;
    return false;
} 
module.exports = getScopeType;