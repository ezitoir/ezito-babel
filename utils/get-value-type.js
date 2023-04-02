

module.exports = function getTypeOfValue(value){
    if( value instanceof Array ) return ['ArrayExpression' , 'arrayExpression']
    switch (typeof value) {
        case 'string':
            return ['StringLiteral','stringLiteral'];
        case 'object': 
            return ['ObjectExpression','objectExpression']; 
        case 'number':
            return ['NumericLiteral','numericLiteral'];
        case 'boolean':
            return ['BooleanLiteral' , 'booleanLiteral']
        case 'function':
            return ['ArrowFunctionExpression' , 'arrowFunctionExpression']
        default:
            return ['Identifier','identifier'];
    }
}