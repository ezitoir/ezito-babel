
module.exports = function isFunctionDefined(nodePath, name ){ 
    let newNodePath = nodePath.isProgram() ? nodePath.scope.block : nodePath.parent || { parent : { body : []}} ; 
    var { body } = newNodePath;
    if(body === undefined){
        return true;
    }
    var is = body.some(function(node){ 
        if(node.type === 'FunctionDeclaration'){ 
            return node.id.name === name; 
        } 
        
        return false;
    });  
    return is;
}