function getType(nodePath , option = { listTypes : [], endCheck : '', is : {}}, typesList){
    option.endCheck = option.endCheck || 'Program';
    if(nodePath.scope.block.type){  
        if(option.listTypes.includes(nodePath.scope.block.type)){ 
            if(option.is && typeof option.is[nodePath.scope.block.type] == "function"){
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
    var typesList = new Array();
    var is = getType(nodePath , option ,typesList);
    if(is) return typesList;
    return false;
} 
module.exports = getScopeType;