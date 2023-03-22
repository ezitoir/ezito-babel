
const getProgram = require('ezito-babel/utils/get-program');
module.exports = function ({ types: t }) {
    let lastImport = {};
    const weakMap = new WeakMap();
    return {
        visitor: {
            ImportDeclaration( nodePath ){
                lastImport = nodePath;
            },
            ExportDeclaration( nodePath , { opts : options , file }) { 
                const newNodePath= t.cloneNode(nodePath);
                const program = getProgram(nodePath);
                let declaration = nodePath.get('declaration');
                //program.unshiftContainer("body",  newNodePath);
                if(t.isExportDefaultDeclaration(nodePath)){
                    switch (declaration.parent.declaration.type){
                        case 'ObjectExpression': 
                            let value = declaration.parent.declaration.value || declaration.parent.declaration.name || declaration.parent.declaration.properties;

                        break;
                        case 'Identifier':
                            let name = declaration.parent.declaration.name ;
                            const exportNameSpecifiers = t.exportDefaultSpecifier(t.identifier(name));
                            //const newNode = t.exportDeclaration([exportNameSpecifiers]);
                            lastImport.insertAfter(exportNameSpecifiers)
                        break;
                    }
                };
                lastImport.insertAfter( t.importDeclaration([t.importDefaultSpecifier(t.identifier('Ezito')) ], t.stringLiteral('ezito/core') ))
            },
        },
    }; 
}