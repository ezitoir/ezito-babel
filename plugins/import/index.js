'use strict';  
const functionNameCreator = require('ezito-babel/utils/function-name-creator'); 
const ezitoTypes = require('ezito-utils/public/validators/types'); 
const babelTypes = require('@babel/types'); 
const { prepare : prepareAddSource } = require('ezito-babel/utils/add-source');
const { prepare : prepareAddImport } = require('ezito-babel/utils/import');
const { prepare : prepareInsertVariable } = require('ezito-babel/utils/insert-variable');
const { prepare : prepareInsertFunction } = require('ezito-babel/utils/insert-function');
const { prepare : prepareAutoImport } = require('ezito-babel/utils/import');
const ezitoBabelAllTypes = require('ezito-babel/types/all');

const visitor = { 
    create({ template , types : t } ,{opts}){ 
        return { 
            ImportDeclaration ( nodePath , { opts , file }){
                const declaration = nodePath.get('declaration');   
                const specifiers = nodePath.get('specifiers');   
                const fileName = file.opts.filename || opts.fileName; 
                let importNameList = [];
                let prepareResult = {};
                let isDefault = false;
                let isImported = '';
                let importName = '';
                if(!ezitoTypes.object(opts)) return ;
                if(!ezitoTypes.function(opts.prepareImportDeclaration)) return; 
                if(!ezitoTypes.oneOfType(ezitoTypes.string,ezitoTypes.undefined)(opts.fileName)) return; 
                
                const prepare = opts.prepareImportDeclaration.call(nodePath ,nodePath,nodePath.node.source.value,fileName,{
                    addFunction : prepareInsertFunction(nodePath,template,t),
                    addImport   : prepareAddImport(nodePath,t),
                    addSource   : prepareAddSource(nodePath ,template,t),
                    addVariable : prepareInsertVariable(nodePath,t),
                    addImport   : prepareAutoImport(nodePath ,t)
                }); 
                if(typeof prepare !== "object") return ;
                 
                if(nodePath.node.specifiers && nodePath.node.specifiers.map && nodePath.node.specifiers.length > 0 ){
                    var iterator = {};
                    for (iterator of nodePath.node.specifiers) { 
                        isDefault = babelTypes.isImportDefaultSpecifier(iterator);
                        isImported = iterator.imported ? iterator.imported.name !== iterator.local.name : false;
                        importName = iterator.local.name;
                        importNameList.push({ 
                            name : iterator.local.name ,
                            importAs : isImported ? iterator.imported.name : false ,
                            isDefault ,
                            template : isDefault ? 'default : ' + importName : isImported ? iterator.imported.name + ' : ' + importName : importName,
                        })
                    }
                    if(importNameList.length === 1 && isDefault && typeof prepare.Default === "function"){
                        prepareResult = prepare.Default.call(nodePath, nodePath.node.source.value ,importNameList)
                    }
                    if(importNameList.length > 1 && typeof prepare.WithCards === "function"){
                        prepareResult = prepare.WithCards.call(nodePath, nodePath.node.source.value ,importNameList)
                    }
                }
                else { 
                    if(typeof prepare.Import === "function"){
                        prepareResult = prepare.Import.call(nodePath, nodePath.node.source.value)
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