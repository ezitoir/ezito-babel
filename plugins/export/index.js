'use strict'; 
const getProgram = require('ezito-babel/utils/get-program'); 
const isFunctionDefined = require('ezito-babel/utils/is-function-defined');
const { prepare : prepareAddSource } = require('ezito-babel/utils/add-source');
const { prepare : prepareAddImport } = require('ezito-babel/utils/import');
const { prepare : prepareInsertVariable } = require('ezito-babel/utils/insert-variable');
const path = require('path');
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
                if(typeof opts !== 'object') return ;
                if(typeof opts.prepareExportDeclaration !== 'function') return;
                const fileName = file.opts.filename || opts.fileName ;  
                const prepare = opts.prepareExportDeclaration.call(nodePath , nodePath , fileName , {
                    addImport : prepareAddImport(nodePath,t),
                    addSource : prepareAddSource(nodePath ,template,t),
                    addVariable : prepareInsertVariable(nodePath,t),
                });
                if(typeof prepare !== "object") return ;
                
                let { node , scope } = nodePath;  
                const require_function = opts.requireFunction  || 'require'; 
                let declaration = nodePath.get('declaration');
                let exportdDefault = '';
                let buildRequire = '';
                let newNode = '';
                if(t.isExportDeclaration(nodePath)){ 
                    if( t.isExportDefaultDeclaration( nodePath )){
                        exportdDefault = declaration.parent ;                  
                        switch ((exportdDefault = exportdDefault.declaration).type ) {
                            case 'ObjectExpression': 
                                let value = declaration.parent.declaration.value || declaration.parent.declaration.name || declaration.parent.declaration.properties;
                                nodePath.replaceWith (template(`module.exports.default =  OBJECT_EXPRESSION ; `)({
                                    OBJECT_EXPRESSION :  t.objectExpression(  value  )
                                }));
                            break;
                            case 'ClassDeclaration': 
                                nodePath.replaceWith (template(`module.exports.default =  CLASS_BODY ; `)({
                                    CLASS_BODY :  t.classExpression( 
                                        declaration.parent.declaration.id ,
                                        declaration.parent.declaration.superClass ,
                                        declaration.parent.declaration.body ,
                                        declaration.parent.declaration.decorators ,
                                    )
                                }));
                            break;
                            case 'FunctionDeclaration':  
                                var fnName = declaration.parent.declaration.id.name;
                                nodePath.insertBefore(t.functionExpression ( 
                                    declaration.parent.declaration.id ,
                                    declaration.parent.declaration.params ,
                                    declaration.parent.declaration.body ,
                                    declaration.parent.declaration.generator 
                                ));
                                nodePath.replaceWith (template(`module.exports.default =  FUNCTION_BODY ; `)({
                                    FUNCTION_BODY :  t.identifier(fnName)
                                }));
                            break ;
                            case 'ArrowFunctionExpression':
                                var fnName = 'e' +  makeId(4) + path.basename(fileName).split('.').at(0);
                                nodePath.insertBefore(template(`const ${fnName} = ARROW_FUNCTION_BODY;`)({
                                    ARROW_FUNCTION_BODY : t.arrowFunctionExpression(  
                                        declaration.parent.declaration.params ,
                                        declaration.parent.declaration.body ,  
                                    )
                                }))
                                nodePath.replaceWith (template(`module.exports.default =  ARROW_FUNCTION_NAME;`)({
                                    ARROW_FUNCTION_NAME :  t. identifier(fnName)
                                })); 
                            break;
                            case 'Identifier':
                                let name = declaration.parent.declaration.name ;
                                var isDef = isFunctionDefined(nodePath , name) ;
                                nodePath.replaceWith (template(`module.exports.default = NAME ;`)({ NAME : name }));
                                
                            break;
                            case 'CallExpression':
                                nodePath.replaceWith (template(`module.exports.default =  FUNCTION_BODY; `)({
                                    FUNCTION_BODY : t.callExpression(
                                        declaration.parent.declaration.callee ,
                                        declaration.parent.declaration.arguments
                                    )
                                })); 
                            break;
                            default: 
                            break;
                        }

                        if(prepare.Default && typeof prepare.Default === 'function'){
                            prepare.Default.call(nodePath ,);
                        }
                    }
                    else if(t.isExportNamedDeclaration(nodePath)) {
                        
                        if( declaration.parent.declaration ){ 
                            switch (declaration.parent.declaration.type) {
                                case 'VariableDeclaration':
                                    declaration.parent.declaration.declarations.map( item =>{
                                        let kind = declaration.parent.declaration.kind ;
                                        let name = item.id.name  ;
                                        let value = item.init.value || item.init.name || item.init.properties;
                                        let type = item.init.type ;
                                        
                                        let isValid = function isValid( type , value ){
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
                                        buildRequire  = template(`${kind} ${name} = VALUE ; Object.defineProperty(exports,"${name}",{enumerable:true,get:function(){return ${name};}});`);
                                        newNode = buildRequire({ 
                                            VALUE : isValid( type , value ),
                                        });
                                        nodePath.replaceWithMultiple(newNode); 
                                    });;
                                break;
                                case 'FunctionDeclaration':
                                    var id = declaration.parent.declaration.id;
                                    var name = declaration.parent.declaration.id.name;
                                    var params = declaration.parent.declaration.params;
                                    var body = declaration.parent.declaration.body; 
                                    var generator = declaration.parent.declaration.generator;
                                    
                                    var value = t.functionExpression( id, params,  body, generator,);
                                    buildRequire  = template(`Object.defineProperty(exports,"${name}",{enumerable:true,get:function(){return VALUE;}});`);
                                        
                                    newNode = buildRequire({ 
                                        VALUE : value,
                                    });
                                    nodePath.replaceWithMultiple(newNode); 
                                break;
                                case 'ClassDeclaration':
                                    var id = declaration.parent.declaration.id;
                                    var name = declaration.parent.declaration.id.name;
                                    var superClass = declaration.parent.declaration.superClass;
                                    var body = declaration.parent.declaration.body; 
                                    var decorators = declaration.parent.declaration.decorators;
                                    
                                    var value = t.classExpression( id, superClass,  body, decorators ,);
                                    buildRequire  = template(`Object.defineProperty(exports,"${name}",{enumerable:true,get:function(){return VALUE;}});`);
                                        
                                    newNode = buildRequire({ 
                                        VALUE : value,
                                    });
                                    nodePath.replaceWithMultiple(newNode); 
                                break;
                            }
                            
                        }
                        else if( declaration.parent.specifiers ){ 
                            let requireModulePath = undefined;
                            if(declaration.parent.source){
                                requireModulePath = declaration.parent.source.value;
                            }
                            const  list = declaration.parent.specifiers.map(function(item){
                                const name = ( item.exported ? item.exported.name : { exported : {}} ) || item.local.name ;
                                const as_name = item.local.name;
                                function templateCreator( type, requirePath ){
                                    switch (type) {
                                        case 'ExportSpecifier' :
                                            if( requirePath){
                                                return  template(
                                                    `Object.defineProperty( exports,"${name}",{
                                                        enumerable : true,
                                                        get : function(){
                                                            return require("${requirePath}").${as_name}
                                                        }
                                                    });` 
                                                )()
                                            }
                                            else {
                                                return  template(
                                                    `Object.defineProperty( exports,"${name}",{
                                                        enumerable:true,
                                                        get:function(){
                                                            return ${(as_name !== name ? as_name + '.': '') + name}
                                                        }
                                                    });`
                                                )()
                                            }
                                    }
                                }
    
                                return templateCreator(item.type , requireModulePath);
                            });
                            nodePath.replaceWithMultiple(list); 
                        } 
                    }
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

//export { default as Ff } from "@babel/plugin-syntax-jsx"
