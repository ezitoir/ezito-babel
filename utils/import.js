const isVariableDefined = require('ezito-babel/utils/is-variable-defined');
const getProgram = require('ezito-babel/utils/get-program');

function _member( name , t ){ 
    return  t.importSpecifier(t.identifier(name), t.identifier(name))
}
function _default( name , t){
    return t.importDefaultSpecifier(t.identifier(name)) ;
} 
function importName (nodePath , types , name , path , isDefault = true  ){
    if(isVariableDefined(nodePath , name)) return ;  
    nodePath = getProgram(nodePath);
    let specifiers =[];
    if( isDefault === true )  
    specifiers = [ _default(name,types) ]
    else
    specifiers = [ _member(name ,types)] ; 
    nodePath.unshiftContainer("body",types.importDeclaration(specifiers, types.stringLiteral(path) ));
}

module.exports.default = importName;
module.exports.prepare = function (nodePath , types){
    return function (name , path , isDefault = true ){
        module.exports.default(nodePath,types,name,path,isDefault)
    }
}