'use strict';   
const babelTypes = require('@babel/types'); 
const ezitoTypes = require('ezito-utils/public/validators/types');
const ezitoBabelExportTypes = require('ezito-babel/types/all').Export ;
const { prepare : prepareAddSource } = require('ezito-babel/utils/add-source');
const { prepare : prepareAddImport } = require('ezito-babel/utils/import');
const { prepare : prepareInsertVariable } = require('ezito-babel/utils/insert-variable'); 
const { prepare : prepareInsertFunction } = require('ezito-babel/utils/insert-function');  
function makeId( count = 5 , characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' ) {
    var result = String('');
    for (let index = 0; index < count ; index++) {
        result += characters.charAt( Math.floor( Math.random() *  characters.length ));
    }
    return result ;
}
const visitor = { 
    create({ template , types : t } ,{opts}){
        return {
            ExportDeclaration ( nodePath ,{ opts , file }){ 
                
                const fileName = file.opts.filename || opts.fileName ; 
                if(!ezitoTypes.object(opts)) return ;
                if(!ezitoTypes.function(opts.prepareExportDeclaration)) return; 
                if(!ezitoTypes.oneOfType(ezitoTypes.string,ezitoTypes.undefined)(opts.fileName)) return; 
               
                const prepare = opts.prepareExportDeclaration.call(nodePath , nodePath , fileName , {
                    addFunction : prepareInsertFunction(nodePath ,template,t),
                    addImport : prepareAddImport(nodePath,t),
                    addSource : prepareAddSource(nodePath ,template,t),
                    addVariable : prepareInsertVariable(nodePath,t),
                    makeId : makeId
                });
                if(!ezitoTypes.object(prepare)) return ;
                  
                let declaration = nodePath.get('declaration');
                let declarationType = '';
                let moduleExportsExpresion = '';
                let withFrom  = '';
                let withCards = [];
                let exportType = '';
                let prepareResult = {};
                let fnUniName = '';
                let variableKind = '';
                let variableName = ''; 
 
                if(babelTypes.isExportDefaultDeclaration(nodePath)){
                    declaration = nodePath.node.declaration;
                    declarationType = declaration.type ;
                    exportType = 'default';
                    switch (declarationType) {
                        case 'ObjectExpression': 
                            let value = declaration.value || declaration.name || declaration.properties;
                            moduleExportsExpresion = t.objectExpression(value); 
                        break;
                        case 'ClassDeclaration':  
                            fnUniName =  declaration.id ? declaration.id : babelTypes.identifier('e' + makeId(8));
                            moduleExportsExpresion = t.classExpression( 
                                fnUniName ,
                                declaration.superClass ,
                                declaration.body ,
                                declaration.decorators ,
                            ); 
                        break;
                        case 'FunctionDeclaration':
                            fnUniName = declaration.id  ? declaration.id : babelTypes.identifier('e' + makeId(8)); 
                            moduleExportsExpresion = t.functionExpression ( 
                                fnUniName ,
                                declaration.params ,
                                declaration.body ,
                                declaration.generator 
                            );
                            nodePath.insertBefore(moduleExportsExpresion);
                            moduleExportsExpresion = fnUniName;
                        break ;
                        case 'ArrowFunctionExpression':
                            moduleExportsExpresion = babelTypes.identifier('e' +  makeId(5));
                            nodePath.insertBefore(template('const NAME = FN;')({
                                NAME : moduleExportsExpresion ,
                                FN : babelTypes.arrowFunctionExpression(  
                                    declaration.params ,
                                    declaration.body ,  
                                )
                            })); 
                        break;
                        case 'Identifier': 
                            moduleExportsExpresion = declaration ;  
                        break;
                        case 'CallExpression':
                            moduleExportsExpresion = t.callExpression(
                                declaration.parent.declaration.callee ,
                                declaration.parent.declaration.arguments
                            ); 
                        break;
                        default: 
                        break;
                    } 
                }

                if(babelTypes.isExportNamedDeclaration(nodePath)){ 
                    let isValid = function isValid( type , value , item){
                        switch (type) {
                            case 'NumericLiteral':
                                return t.numericLiteral( value ); 
                            case 'StringLiteral':
                                return t.stringLiteral( value );
                            case 'ObjectExpression':
                                return t.objectExpression( value );
                            case 'ClassExpression': 
                                return t.classExpression(item.init.id, item.init.superClass, item.init.body, item.init.decorators );
                            case 'FunctionExpression':
                                return t.functionExpression(item.init.id, item.init.params, item.init.body, item.init.generator );
                            case 'ArrowFunctionExpression':
                                return t.arrowFunctionExpression(item.init.params, item.init.body );
                            case 'MemberExpression': 
                                return t.memberExpression(item.init.object , item.init.property );
                            case 'CallExpression' :
                                const nn = item.init.callee.name || item.init.callee.type ;
                                if( nn === "Import" ){
                                    return t.callExpression(t.identifier(require_function), item.init.arguments)
                                }
                                return t.callExpression(item.init.callee, item.init.arguments) ;
                            case 'BooleanLiteral':
                                return t.booleanLiteral(value);
                            case 'StringLiteral' :
                                return t.stringLiteral(value);
                            case 'NumbericLiteral' :
                                return t.numbericLiteral(value)
                            default:
                                return value;
                        }
                    };
                    declaration = nodePath.node.declaration === null ? nodePath.node.specifiers : nodePath.node.declaration;
                    declarationType = nodePath.node.declaration === null ? nodePath.node.type : declaration.type ;
                    
                    switch (declarationType) {
                        case 'VariableDeclaration':
                            exportType = 'variable' ;
                            declaration = declaration instanceof Array ? declaration : [declaration];
                            for (const childNode of declaration) { 
                                variableKind = childNode.kind ;
                                var newDeclarations = childNode.declarations;
                                for (const itDec of newDeclarations) { 
                                    variableName = itDec.id.name  ;
                                    let value = itDec.init.value || itDec.init.name || itDec.init.properties;
                                    let type = itDec.init.type ;
                                    moduleExportsExpresion = isValid( type , value , itDec);
                                }
                            }
                        break;
                        case 'FunctionDeclaration':
                            exportType = 'export'; 
                            var id = declaration.id; 
                            var params = declaration.params;
                            var body = declaration.body; 
                            var generator = declaration.generator;
                            nodePath.insertBefore(t.functionExpression(id, params,  body, generator,));
                            moduleExportsExpresion = declaration.id;
 
                        break;
                        case 'ClassDeclaration' :
                            exportType = 'export';
                            var id = declaration.id; 
                            var name = declaration.id.name;
                            var superClass = declaration.superClass;
                            var body = declaration.body; 
                            var decorators = declaration.decorators; 
                            nodePath.insertBefore(t.classExpression( id, superClass,  body, decorators ,))
                            moduleExportsExpresion = id ;  
                        break;
                        case 'ExportNamedDeclaration' :
                            declaration = declaration instanceof Array ? declaration : [ declaration ];
                            withFrom = nodePath.node.source ? nodePath.node.source.value : null;
                            exportType = withFrom ? 'withfrom' : 'withcards';
                            for (const newChild of declaration) {
                                withCards.push({
                                    withFrom ,
                                    name :  newChild.exported.name,
                                    withAs :  newChild.local.name == newChild.exported.name ? false : newChild.local.name ,
                                })
                            } 
                        break ;
                        default:
                        break;
                    }  
                } 

 
                switch (exportType) {
                    case 'default':
                        if(prepare.Default && typeof prepare.Default === "function"){ 
                            prepareResult = prepare.Default.call(nodePath,moduleExportsExpresion);
                            if(ezitoTypes.object(prepareResult)){
                                if(ezitoBabelExportTypes.isDefault(prepareResult)){
                                    
                                }
                                else {
                                    nodePath.replaceWith(prepareResult)
                                } 
                            }
                        }
                    break;
                    case 'export':
                        if(prepare.Export && typeof prepare.Export === "function"){
                            prepareResult = prepare.Export.call(nodePath,moduleExportsExpresion);
                            if(ezitoTypes.object(prepareResult)){
                                if(ezitoBabelExportTypes.isExport(prepareResult)){
                                    
                                }
                                else {
                                    nodePath.replaceWith(prepareResult)
                                } 
                            }
                        }
                    break;
                    case 'variable' :
                        if(prepare.Variable && typeof prepare.Variable === "function"){
                            prepareResult = prepare.Variable.call(nodePath,variableKind,variableName,moduleExportsExpresion);
                            if(ezitoTypes.object(prepareResult)){
                                if(ezitoBabelExportTypes.isVariable(prepareResult)){
                                    
                                }
                                else {
                                    nodePath.replaceWith(prepareResult)
                                } 
                            }
                        }
                    break;
                    case 'withcards':
                        if(prepare.WithCards && typeof prepare.WithCards === "function"){
                            prepareResult = prepare.WithCards.call(nodePath,withCards);
                            if(ezitoTypes.object(prepareResult)){
                                if(ezitoBabelExportTypes.isWithCards(prepareResult)){
                                    
                                }
                                else {
                                    nodePath.replaceWith(prepareResult)
                                } 
                            }
                        }
                    break;
                    case 'withfrom':
                        if(prepare.WithFrom && typeof prepare.WithFrom === "function"){
                            prepareResult = prepare.WithFrom.call(nodePath,withFrom ,withCards);
                            if(ezitoTypes.object(prepareResult)){
                                if(ezitoBabelExportTypes.isWithFrom(prepareResult)){
                                    
                                }
                                else {
                                    nodePath.replaceWith(prepareResult)
                                } 
                            }
                        }
                    break;
                    default:
                        break;
                }
            }
        }
    }
};
const exportDeclaration = function ({ template , types : t } ,{opts}){ 
    return { 
        visitor : visitor.create({ template , types : t } ,{opts})
    } 
};
exportDeclaration.visitor = visitor;
module.exports = exportDeclaration;
 