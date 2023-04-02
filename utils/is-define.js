'use strict';
const getProgram = require('ezito-babel/utils/get-program')
const { default : parseVariableString} = require('ezito-babel/utils/parse-variable-string')
module.exports = function isDefined(nodePath, name, type = 'function'){
    
    var ntype = nodePath.type;
    var types = {
        "function" : {
            type : ['FunctionDeclaration'] ,
            is(node,name){ 
                return node.id.name === name;
            }
        }, 
        "variable" : {
            type : ['VariableDeclaration' , 'Identifier'] ,
            is(node , name){
                
                const kind = node.kind;
                if(node.declarations && node.declarations.length)
                for (const childNode of node.declarations) { 
                    if(childNode.type === 'VariableDeclarator'){
                        var varName = childNode.id.name;  
                        if( varName === name ) return true ;
                    }
                }

                if(node.type === "Identifier") {
                    var isVar = parseVariableString(node.name);
                    if(isVar){ 
                        return isVar.name === name ;
                    }
                }
                return false;
            }
        }
    };  
    switch (nodePath.type) {
        case 'CallExpression':
            nodePath = nodePath.parentPath
        break; 
        default:
            break;
    }
    const { parent  } = nodePath;
    if(!parent) return false;
    const { body } = parent;

    if(!Array.isArray(body)) return false;  
    
    var newNode = {}; 
    var is = body.some(function(node){
        if(types[type].type.includes(node.type)){
            newNode = node; 
            return types[type].is( node , name)
        }
        return false;
    }); 
    return is ? newNode : is ;
}