

module.exports.default = function parseVariableString( source ){
    source = source.trim();
    const kind = module.exports.getKind(source);
    if(!kind) return false;
    const name = module.exports.getName(source);
    const value = module.exports.getValue(source);
    if(kind){
        return {
            kind , name , value 
        }
    }
    return false;
};
module.exports.getKind = function getKind( source){
    source = source.trim();
    var constKind = 'const ';
    var varKind = 'var ';
    var letKind = 'let ';
    if( source.slice(0 , constKind.length) === constKind){
        return 'const'
    }
    if( source.slice(0 , varKind.length) === varKind){
        return 'var';
    }
    if( source.slice(0 , letKind.length) === letKind){
        return 'let'
    }
};
module.exports.getName = function getName(source){
    const kind = module.exports.getKind(source);
    return source.slice(kind.length , source.indexOf('=')).trim()
};
module.exports.getValue = function getValue(source){
    return source.slice( source.indexOf('=') + 1, source.length );
}