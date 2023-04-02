const babel = require('@babel/core');
const babelTypes = require('@babel/types');
const babelTemplate = require('@babel/template');
const getTypeOfValue = require('ezito-babel/utils/get-value-type');
const ezitoTypes = require('ezito-utils/public/validators/types');
const objectToNode = function objectConvertToNode(o = {},t ){
    /**
     * example objectToNode({ name : "json" , old : 14 , home :[ "723" , true ]})
     */
    var objectEx  = t.objectExpression([]);
    /**
        type.objectExpression([
            type.objectProperty(type.identifier("key") , type.numericLiteral(0))
        ])
     */
    function creator(object , type , objectExpersion){
        for (const key in object) {
            if (Object.hasOwnProperty.call(object, key)) {
                const value = object[key];
                var [a,b] = getTypeOfValue(value);
                if(type[b]){ 
                    if(typeof value === "object" && !(value instanceof Array)){
                        var objTemp = creator(value , type ,t.objectExpression([]))
                        objectExpersion.properties.push(
                            type.objectProperty(type.identifier(key),objTemp)
                        )
                    }
                    else {
                        if(value instanceof Array ){ 
                            var listTemp = [];
                            for (const item of value) {
                                if(typeof item === 'object' || item instanceof Array){
                                    var objTemp = creator(item , type ,t.objectExpression([])); 
                                    
                                    listTemp.push(
                                        objTemp
                                    )
                                }
                                else {
                                    var [a,bb] = getTypeOfValue(item);  
                                    if(type[bb]) listTemp.push(
                                        type[bb](item)
                                    ) 

                                }
                            }
                            objectExpersion.properties.push(
                                type.objectProperty(type.identifier(key) , type[b](listTemp))
                            )
                        }
                        else {
                            objectExpersion.properties.push(
                                type.objectProperty(type.identifier(key) ,type[b](value))
                            )
                        } 
                    }
                }
            }
        } 
        return objectExpersion;
    }
    return creator( o , t , objectEx);
};

module.exports = objectToNode;