'use strict';  
const functionNameCreator = require('ezito-babel/utils/function-name-creator'); 
const { prepare : prepareAddSource } = require('ezito-babel/utils/add-source');
const { prepare : prepareAddImport } = require('ezito-babel/utils/import');
const { prepare : prepareInsertVariable } = require('ezito-babel/utils/insert-variable');
const { prepare : prepareInsertFunction } = require('ezito-babel/utils/insert-function');

const visitor = { 
    create({ template , types : t } ,{opts}){ 
        return { 
            ImportDeclaration ( nodePath , { opts , file }){
                prepareInsertFunction(nodePath,template,t)(function name1(){})
                if(typeof opts !== 'object') return ;
                if(typeof opts.prepareImportDeclaration !== 'function') return;
                const declaration = nodePath.get('declaration');
                const modulePath = declaration.parent.source.value ; 
                const fileName = file.opts.filename || opts.fileName;   
                const prepare = opts.prepareImportDeclaration.call(nodePath,nodePath,modulePath, fileName ,{
                    addFunction: prepareInsertFunction(nodePath,template,t),
                    addImport : prepareAddImport(nodePath,t),
                    addSource : prepareAddSource(nodePath ,template,t),
                    addVariable : prepareInsertVariable(nodePath,t),
                });
                if(typeof prepare !== "object") return ; 
                if(declaration.parent.specifiers.length === 0 ){ 
                    if(typeof prepare.Import === "function" ){
                        const { functionName , newModulePath } = prepare.Import.call(nodePath , modulePath) || {};
                        if(!functionName) return ;
                        const [ newName , temp ] = functionNameCreator( functionName || 'requrie' , 'VALUES');
                        let newPath = newModulePath || modulePath;
                        if(newPath instanceof String){
                            nodePath.replaceWith(template(newName)({
                                ['VALUES'] : t.identifier(newPath.toString())
                            }));
                        }
                        else {
                            nodePath.replaceWith(template(newName)({
                                ['VALUES'] : t.stringLiteral(newPath)
                            })); 
                        }
                    }
                }
                else {
                    let importName = []; 
                    var newPath = '';
                    var newName , temp , importType = '';
                    for (const childNode of declaration.parent.specifiers) {
                        if(childNode.type === 'ImportDefaultSpecifier'){
                            importType = 'ImportDefault';
                            if(childNode.imported){
                                if( childNode.local.name  === childNode.imported.name )
                                importName.push(childNode.local.name );
                                else
                                importName.push(childNode.imported.name + ' : ' + childNode.local.name);
                            }
                            else {
                                importName.push('default : ' + childNode.local.name)
                            }
                        }
                        else if(childNode.type ==='ImportSpecifier'){
                            importType = 'ImportWithCards';
                            if(childNode.imported){
                                if( childNode.local.name  === childNode.imported.name )
                                importName.push(childNode.local.name);
                                else
                                importName.push(childNode.imported.name + ' : ' + childNode.local.name);
                            }
                            else {
                                importName.push('default : ' + childNode.name );
                            }
                        } 
                    }
                    if(typeof prepare[importType] === "function"){
                        const { functionName , newModulePath } = prepare[importType].call(nodePath , modulePath) || {};
                        if(!functionName) return ;
                        [ newName , temp ] = functionNameCreator( functionName || 'requrie' , 'VALUES');
                        newPath = newModulePath || modulePath;
                    }
                    if(importName.length > 0){ 
                        nodePath.replaceWith(template('VALUES')({
                            ['VALUES'] : t.identifier(('const {' + importName.join(',') + '} = ' + newName + ';').replace('VALUES',`"${newPath}"`))
                        })); 
                    }
                }
            },

        }
    }
}
 

const importDeclaration =  function ({ template , types : t } ,{opts}){  
    return { 
        pre(state){
            //state.scope
            //state.scope.globals
            //state.scope.plugins  
        },
        visitor : {
            ...visitor.create({ template , types : t },{opts}) ,
            Identifier ( nodePath , { opts }){ 
                let { node , scope } = nodePath;
                let { bindings, parent } = scope ;
                let specifiers = nodePath.get('specifiers');
                let declaration = nodePath.get('declaration');
                const { parent : decParent } = declaration ;  
                if(t.isCallExpression(declaration.parentPath.parentPath)){
                    if(t.isImport(declaration.parentPath.parentPath.node.callee)){
                        const args = declaration.parentPath.parentPath.node.arguments;
                        // declaration.parentPath.parentPath.replaceWith 
                    }
                } 
            },
            ExportAllDeclaration (){ },
            ExportDefaultDeclaration(){ },
            ExportNamedDeclaration(){}, 
            Import( nodePath , { opt }){ },
            FunctionDeclaration(nodePath ){ } ,
            Method (nodePath, { opts }){},
            JSX (nodePath, { opts }){},
            Immutable (nodePath , { opts }){ },
            ExportDeclaration ( nodePath ,{ opts }){ },
            Program(nodePath , state ) {},
            FunctionExpression(){} ,
            ArrowFunctionExpression(){ },
        },
    };
};
importDeclaration.visitor = visitor;
module.exports = importDeclaration;