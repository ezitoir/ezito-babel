

module.exports = function functionNameCreator(functionNameList , templateKey = 'ARGUMENTS'){
    functionNameList = functionNameList instanceof Array ? functionNameList : [ functionNameList ];
    var closeFunction = functionNameList.map( i => ')').join(''); 
    var startFunction = functionNameList.join('(') + '(';
    return [ startFunction + templateKey + closeFunction , templateKey ];
};