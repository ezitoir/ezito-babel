'use strict'; 
const functionNameCreator = require('ezito-babel/utils/function-name-creator');
 
const argumantsBuidlre = function (args , types){ 
    if( types.arrayExpression) return types.arrayExpression(args)
}; 
module.exports = function ({ Plugin , template , types : t } ,{opts}){  
    return {
        visitor : {
            CallExpression( path , { opts }){

                if( typeof opts !== 'object') return ;
                if(typeof opts.prepare !== 'function') return;
                const args = path.node.arguments; 
                const type = path.node.callee.type;
                const name = path.node.callee.name;
                const prepare = opts.prepare();
                if(typeof prepare !== 'object') return;
                const { requireFunctionName } = opts;
                if ( typeof requireFunctionName === "function")  return ;

                if( type === "Identifier" && name === "require"){ 
                    if(typeof prepare.Require === "function" ){
                        const { calleeName , calleArgs } = prepare.Require.call(path , args) || {};
                        if(!calleeName) return ;
                        const [ newName , temp ] = functionNameCreator( calleeName || name , '...VALUES');
                        const newArgs = calleArgs || args ;   
                        path.replaceWith(template(newName)({
                            ['VALUES'] : argumantsBuidlre(newArgs ,t)
                        }));
                        path.skip();
                    }
                }

                else if( type === 'Import' &&  name === undefined){
                    if(typeof prepare.Import === "function" ){  
                        const { calleeName , calleArgs } = prepare.Import.call(path , args) || {};
                        if(!calleeName) return ;
                        const [ newName , temp ] = functionNameCreator( calleeName || name ,'...VALUES');
                        const newArgs = calleArgs || args ;   
                        path.replaceWith(template(newName)({
                            ['VALUES'] : argumantsBuidlre(newArgs ,t)
                        }));
                        path.skip();
                    }
                }

                else if(type === 'MemberExpression'){
                    //console.log(path.node.callee)
                    //t.callExpression(t.identifier( requireFunctionName || obj.name), obj.args )
                }
                else {
                    if( type === "Identifier" && typeof prepare[name] === 'function'){
                        const { calleeName , calleArgs } = prepare.prepare[name].call(path , args) || {};
                        if(!calleeName) return ;
                        const [ newName , temp ] = functionNameCreator( calleeName || name ,'...VALUES');
                        const newArgs = calleArgs || args ;   
                        path.replaceWith(template(newName)({
                            ['VALUES'] : argumantsBuidlre(newArgs ,t)
                        }));
                        path.skip();
                    }
                }
            },
            
        }
    }
};