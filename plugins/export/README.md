# EzitoIR ezito-utils

## Installation

    npm install https://github.com/ezitoir/ezito-utils.git

## Usage

```javascript
const babelCore = require('@babel/types');
const babelTypes = require('@babel/types');
const babelTemplate = require('@babel/template');
babelCore.transformSync(fs.readFileSync('./i.js' ,'utf-8'),{  
    plugins : [
        ["ezito-babel/plugins/export",{
        prepareExportDeclaration(nodePath , fileName , fns){
            fileName = fileName || option.optionFileName;  
            return {
                Default(f){  
                    this.replaceWith(babelTemplate.default('module.exports.default = VALUE;')({
                        VALUE : babelTypes.callExpression(
                            babelTypes.identifier('WhitCookie') ,
                            [f]
                        )
                    }))
                },
                Export(f){
                    this.replaceWith(
                        babelTemplate.default('module.exports.NAME = NAME;')({
                            NAME : f
                        })
                    )
                },
                Variable(kind , name , nodeValue){ 
                    this.insertBefore(babelTemplate.default(`${kind} ${name} = VALUE;`)({
                        VALUE : nodeValue
                    }));
                    this.replaceWith(babelTemplate.default(`Object.defineProperty(exports, 'NAME' ,{
                        writable : false ,
                        value : VALUE
                    })`)({
                        NAME : name ,
                        VALUE : name
                    })); 
                },
                WithCards(cardsList){ 
                    for (const iterator of cardsList) { 
                        this.insertBefore(babelTemplate.default('module.exports.NAME = WITH')({
                            NAME : iterator.name ,
                            WITH : iterator.withAs ? iterator.withAs +'.'+iterator.name : iterator.name
                        }));
                    }
                    this.remove()
                },
                WithFrom (importPath , cardsList){
                    var name = 'e' + fns.makeId(8);
                    fns.addVariable('var' , name , `require('${importPath}')`);
                    for (const iterator of cardsList) {
                        this.insertBefore(babelTemplate.default('module.exports.NAME = WITH')({
                            NAME : iterator.name ,
                            WITH : iterator.withAs ? name  +'.' + iterator.withAs : name + '.' + iterator.name
                        }));
                    }
                    this.remove()
                }
            }
        },
        }]
    ] , 
})

