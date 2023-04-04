# EzitoIR ezito-utils

## Installation

    npm install https://github.com/ezitoir/ezito-babel-plugins.git
    npm install ezito-babel-plugins
    
## Usage

```js
const babel = require('@babel/core');
babel.transform("",{
    plugins : [
        ['ezito-babel/plugins/call-import-export', {
            prepareCallFunction( nodePath , fileName , fns){  
                fileName = fileName || optionFileName; 
                return {
                    Require : (args) =>{ 
                        var isExists = paths.getImportPathInfo(args[0].value , fileName);
                        // args is array of call args
                        // args[0].value 
                        return {
                            calleeArgs : args,
                            calleeName : '_____ezitoCssLoader'
                        }
                    },
                    Import : (args) => {
                        //return config(args,fileName,fns);
                    },
                    useServerSideProps : () => {
                        
                    },
                }
            },
            prepareImportDeclaration(nodePath,importPath,fileName,fns){ 
                fileName = fileName || optionFileName;
                 
                return {
                    ImportDefault(path){
                        return {
                            newModulePath : relativePath ,
                            functionName : [ 'interopRequireDefaultAndWithCard', 'require']
                        }
                    },
                    ImportWithCards(path){
                        return {
                            newModulePath : relativePath ,
                            functionName : [ 'interopRequireDefaultAndWithCard', 'require']
                        }
                    },
                    Import(path){ 
                        /**
                         * if newModulePath == new String convert to cssLoader("example" , "*" , ...)
                         * using identifier
                         */
                        return {
                            newModulePath : new String(`"${relativePath}" , '*'`),
                            functionName : 'cssLoader'
                        } 
                    },
                }
            },
            prepareExportDeclaration(nodePath , fileName , fns){
                fileName = fileName || optionFileName; 
                return {
                    Default(){ 
                        if(paths.enyCheck(paths.isComponent(fileName), paths.isPage(fileName))){ 
                            fns.addVariable('const' , 'react',"require('react');",{insert :"unshiftContainer"});
                            fns.addSource(`module.exports.default = cssLoader(module.exports).default;` , { push : true });
                        }
                    }
                }
            },
            fileName : optionFileName,
        }],
        //["ezito-babel/plugins/shift-exports-to-up" , { }],
        ["ezito-babel/plugins/commonjs-export",{
            prepareCommonJSExport(nodePath,fileName,{ addSource , addVariable }){
                return {
                    '*' : ()=>{
                    },
                    'module.exports.*':()=>{

                    },
                    'exports.*' : ()=>{

                    }
                }
            }
        }],
        ["ezito-babel/plugins/insert-function" , { }],
        ["ezito-babel/plugins/auto-import" ,{
            prepareAutoImport(nodePath , fileName){
                fileName = fileName || optionFileName;
                return [
                    { name : "React" , path : "react" },
                ]
            }
        }]
        ,
        ["ezito-babel/plugins/add-source" , {
            prepareAddSource(nodePath , fileName){
                fileName = fileName || optionFileName ; 
                
            },
        }] ,  
    ] ,
});
```
