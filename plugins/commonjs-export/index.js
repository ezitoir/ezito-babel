'use strict'; 
 
const getPeropertyNames = require('ezito-babel/utils/get-expression-property-names');
const isAssignmentExpression = require('ezito-babel/utils/is-assignment-expression');
const getScopeType = require('ezito-babel/utils/get-scope-type');
const { prepare : prepareAddSource } = require('ezito-babel/utils/add-source');
const { prepare : prepareAddImport } = require('ezito-babel/utils/import');
const { prepare : prepareInsertVariable } = require('ezito-babel/utils/insert-variable');
const { prepare : prepareInsertFunction } = require('ezito-babel/utils/insert-function');

const visitor = { 
    create({ template , types : t } ,{opts}){ 
        return { 
            Identifier ( nodePath , { opts , file }){
                if(typeof opts !== 'object')  return;
                if(typeof opts.prepareCommonJSExport !== 'function') return;  
                return ;
                const fileName = file.opts.filename || opts.fileName;
                let newFileName = { fileName : undefined , targetFileName : fileName };
                const prepare = opts.prepareCommonJSExport.call(nodePath , nodePath , fileName , {
                    addImport : prepareAddImport(nodePath,t),
                    addSource : prepareAddSource(nodePath ,template,t),
                    addVariable : prepareInsertVariable(nodePath,t),
                },{ isBlock : { fileName : newFileName.fileName , targetFileName : newFileName.targetFileName } });
                
                if(nodePath.parent.type === "AssignmentExpression" && nodePath.parent.operator === "="){
                    console.log('dasdasd')
                    function callAll(){
                        if(typeof prepare['*'] === 'function'){
                            prepare['*'].call(nodePath ,nodePath);
                        } 
                    }
                    if(nodePath.parent.left.type === "Identifier" && nodePath.parent.left.name === "exports"){  
                        var types = {
                            FunctionExpression : {
                                is(nodePath){
                                    var lTypes = {
                                        Program : {
                                            is(){
                                                return true;
                                            }
                                        },
                                        BlockStatement : {
                                            is(scope){
                                                return scope.path.parentPath.scope.block.type === "Program";
                                            }
                                        }
                                    }
                                    if(lTypes[nodePath.scope.path.parentPath.scope.block.type]){ 
                                        return lTypes[nodePath.scope.path.parentPath.scope.block.type].is(nodePath.scope.path.parentPath.scope);
                                    }
                                }
                            },
                            ArrowFunctionExpression : {
                                is(nodePath){
                                    return ["Program"].includes(nodePath.scope.path.parentPath.scope.block.type);
                                }
                            },
                            BlockStatement:{
                                is(nodePath){ 
                                    return true ;
                                }
                            },
                            Program: {
                                is(){
                                    return true;
                                }
                            }
                        } 
                        if(types[nodePath.scope.block.type]){
                            if(!types[nodePath.scope.block.type].is(nodePath)) return ;
                        }
                        else {
                            return ;
                        }
    
                        if(nodePath.scope.block.type === 'BlockStatement'){
                            require(fileName);
                            var fn = require.cache[fileName].children[0] ?? newFileName ;
                            newFileName.fileName = fn.filename || fn.fileName;
                            delete require.cache[fileName];
                        }

                        const prepare = opts.prepareCommonJSExport.call(nodePath , nodePath , fileName ,{
                            addImport : prepareAddImport(nodePath,t),
                            addSource : prepareAddSource(nodePath ,template,t),
                            addVariable : prepareInsertVariable(nodePath,t),
                        },{ isBlock : { fileName : newFileName.fileName , targetFileName : newFileName.targetFileName } });
                        if(typeof prepare !== "object")  return ;
                        if(nodePath.parent.left.name === "exports"){
                            if(typeof prepare['exports'] === 'function'){
                                prepare['exports'].call(nodePath , nodePath ,)
                            }
                            return callAll();
                        }
                    }
                }  
            }, 
            MemberExpression(nodePath ,{opts ,file}){
                if(typeof opts !== 'object')  return;
                if(typeof opts.prepareCommonJSExport !== 'function') return;  
                const fileName = file.opts.filename || opts.fileName; 
                let newFileName = { fileName : undefined , targetFileName : fileName };
                var parseExpression = isAssignmentExpression(nodePath);
                if(!parseExpression) return ; 
                const { type , parentType , left ,context } = parseExpression ; 
                if( parentType === 'MemberExpression' && left.object){
                    const [ objectName  , index ] = getPeropertyNames(left); 
                    if(objectName[0] === 'module' || objectName[0] === 'exports'){ 
                        var listTypes = ['FunctionExpression','ArrowFunctionExpression',"BlockStatement"];
                        var is = {
                            "BlockStatement" : (type) => {
                                return ['IfStatement' , 'SwitchStatement'].includes(type)
                            } ,
                            "FunctionExpression" : (type) => {
                                return ['CallExpression'].includes(type)
                            },
                            "ArrowFunctionExpression" : ( type) =>{
                                return ['CallExpression'].includes(type)
                            }
                        };
                        var isType = getScopeType(nodePath ,{ listTypes ,endCheck : 'Program', is}); 
                        if(!isType) return ; 
                        if(nodePath.scope.block.type === 'BlockStatement'){
                            require(fileName);
                            var fn = require.cache[fileName].children[0] ?? newFileName;
                            newFileName.fileName = fn.filename || fn.fileName;
                            delete require.cache[fileName]; 
                        }
                        const prepare = opts.prepareCommonJSExport.call(nodePath , nodePath , fileName , {
                            addFunction : prepareInsertFunction(nodePath , template ,t),
                            addImport : prepareAddImport(nodePath,t),
                            addSource : prepareAddSource(nodePath ,template,t),
                            addVariable : prepareInsertVariable(nodePath,t),
                        },{ isBlock : { fileName : newFileName.fileName , targetFileName : newFileName.targetFileName } });
                        if(typeof prepare !== "object") return ; 
                        function callAll(){
                            if(typeof prepare['*'] === 'function'){
                                prepare['*'].call(nodePath ,nodePath);
                            } 
                        }
                        
                        switch(objectName[0]){
                            case "module" : 
                                if(objectName[1] === 'exports'){  
                                    if(index === 2 && typeof prepare['module.exports'] === 'function'){
                                        const parser = prepare['module.exports'].call(nodePath , nodePath , index );
                                        if(typeof parser === "object"){
                                            const  { spliter , value  } = parser ;
                                            if(typeof spliter === "number"){
                                                var propertyNames = objectName.slice(spliter);
                                                nodePath.replaceWith(
                                                    t.identifier(
                                                        [value , ...propertyNames ] .join('.')
                                                    )
                                                )
                                            } 
                                        }
                                    }
                                    if(index > 2 && typeof prepare['module.exports.*'] === 'function'){
                                        const parser = prepare['module.exports.*'].call(nodePath,nodePath);
                                        if(typeof parser === "object"){
                                            const  { spliter , value  } = parser ;
                                            if(typeof spliter === "number"){
                                                var propertyNames = objectName.slice(spliter);
                                                nodePath.replaceWith(
                                                    t.identifier(
                                                        [value , ...propertyNames ] .join('.')
                                                    )
                                                )
                                            } 
                                        }
                                    }
                                    callAll();
                                }
                            break;
                            case "exports" :
                                if(index >= 2 && typeof prepare['exports.*'] === 'function'){
                                    const parser = prepare['exports.*'].call(nodePath,nodePath);
                                    if(typeof parser === "object"){
                                        const  { spliter , value  } = parser ;
                                        if(typeof spliter === "number"){
                                            var propertyNames = objectName.slice(spliter);
                                            nodePath.replaceWith(
                                                t.identifier(
                                                    [value , ...propertyNames ] .join('.')
                                                )
                                            )
                                        } 
                                    }
                                }
                                callAll();
                            break;
                        }
                    } 
                }
             }
        }
    }
} 
const commonjsExport =  function ({ template , types : t } ,{opts}){  
     return {
        visitor : {
            ...visitor.create({ template , types : t },{opts}) ,
        },
    };
};
commonjsExport.visitor = visitor;
module.exports = commonjsExport;