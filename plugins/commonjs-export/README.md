



```javascript
customPluginsConfig.add(["ezito-babel/plugins/commonjs-export",{
    prepareCommonJSExport(nodePath,fileName,{ addSource , addVariable }){
        return {
            '*' : ()=>{
            },
            'module.exports.*': (ddd ,f,ri) => { 
                return {
                    right : babelTypes.callExpression(
                        babelTypes.identifier('withCookie') ,
                        [ri] 
                    ), 
                }
            },
            'exports.*' : ()=>{
            }
        }
    }
}]);

// exapmle 
module.exports.default = function Router(){}

/**
 * output 
 * 
 * module.exports.default = withCookie(function Router(){})
 *
 * /
