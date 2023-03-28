
module.exports = function isFunctionDefined(nodePath, name , type){
    if( typeof name === 'function'){
        var bodyFn = Function.prototype.toString.call(name);
        name = bodyFn.trim().slice(0 , bodyFn.indexOf('(')).trim();
    }
    const { parent  } = nodePath;
    if(!parent) return false;
    const { body } = parent;
    if(!Array.isArray(body)) return false;
    var newNode = {}; 
    var is = body.some(function(node){ 
        if(node.type === 'FunctionDeclaration'){
            newNode = node;
            return node.id.name === name; 
        } 
        return false;
    }); 
    return is ? newNode : is ;
}