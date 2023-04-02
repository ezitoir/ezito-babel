'use strict';

module.exports = function (...plugins){
    return function (context,options){
        var result = { visitor : {}};
        for (const iterator of plugins) {
            var resultPlugin = require(iterator)(context,options);
            result.visitor = { visitor : { ...result.visitor , ...resultPlugin.visitor }};
        }
        return visitor;
    }
}