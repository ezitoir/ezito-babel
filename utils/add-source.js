
const getProgram = require('ezito-babel/utils/get-program');
const isFunction = require('ezito-utils/public/is/function');
const isString = require('ezito-utils/public/is/string');
const isFunctionDefined = require('ezito-babel/utils/is-function-defined'); 
const isDefined = require('ezito-babel/utils/is-define');
const { default : parseVariableString} = require('ezito-babel/utils/parse-variable-string')

module.exports.default = function addSource( nodePath , template , types , source , option ={}){
    const program = getProgram(nodePath);
    const container = option.push ? program.pushContainer : program.unshiftContainer ;
    if(isString(source)){
        source = source.trim(); 
        var isVar = parseVariableString(source);
        if(isVar){ 
            if(isDefined(nodePath,isVar.name,'variable')){ 
                return ;
            }
        }; 
        container.call(program , 'body' , types.identifier(source));
    }
    else if(isFunction(source)){ 
        if(!isFunctionDefined(nodePath , source)){
            container.call(program , 'body' , types.identifier(Function.prototype.toString.call(source)));
        }
    }
    else if(typeof source instanceof Array){ 
        for (const iterator of source) {
            if(isFunction(iterator)){
                if(!isFunctionDefined(program , iterator)){
                    container.call(program , 'body' , types.identifier(Function.prototype.toString.call(iterator)));
                }
            }
            else if(isString(iterator)){
                source = source.trim(); 
                var isVar = parseVariableString(source);
                if(isVar){   
                    if(isDefined(nodePath,isVar.name,'variable')){
                        return ;
                    }
                }; 
                container.call(program , 'body' , types.identifier(source));
            }
        }
    }
};
module.exports.prepare = function prepareAddSource( nodePath , template , types ){
    return function (source , option = { }){
        module.exports.default( nodePath , template , types , source , option);
    }
}