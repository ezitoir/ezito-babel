 

module.exports = function functionNameCreator(functionNameList , templateKey = 'ARGUMENTS'){
    functionNameList = functionNameList instanceof Array ? functionNameList : [ functionNameList ];
    var closeFunction = functionNameList.map( i => ')').join(''); 
    var startFunction = functionNameList.join('(') + '(';
    return [ startFunction + templateKey + closeFunction , templateKey ];
};
module.exports['default'] = module.exports;
module.exports.createArrayTemplate = function (arrayName , templateKey) {
    var result = [];
    for (const iterator of arrayName) {
        result.push(iterator);
        result.push('(')
    }
    result.push(templateKey)
    for (let index = 0; index <  arrayName.length ; index++) {
        result.push(')')
    }

    return result.join('');
}