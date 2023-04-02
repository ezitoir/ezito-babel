'use strict';
const ezitoTypes = require('ezito-utils/public/validators/types');
const babelTypes = require('@babel/types');


function createCallExpression(callNames , args){
    callNames = (ezitoTypes.array(callNames) ? callNames : [callNames]).reverse();
    args = ezitoTypes.array(args) ? args : [args];
    var resultTypes = {};
    for (const iterator of callNames) {
        if(babelTypes.isCallExpression(resultTypes)){
            resultTypes = babelTypes.callExpression(
                babelTypes.identifier(iterator) ,
                [resultTypes]
            );
        }
        else {  
            resultTypes = babelTypes.callExpression(
                babelTypes.identifier(iterator),
                args
            );
        }
    } 
    return resultTypes;
}

module.exports = createCallExpression;