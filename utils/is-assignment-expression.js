function isAssignmentExpression (nodePath){
    if(!(nodePath.parentPath.container || nodePath.parentPath.expression)) return false;
    var assignmentExpression = nodePath.parentPath.container ;
    if( assignmentExpression.type === "ExpressionStatement"){
        if(assignmentExpression.expression.type === 'AssignmentExpression' ){
            if(assignmentExpression.expression.operator === '='){
                return {      
                    parentType : 'MemberExpression',
                    type : 'AssignmentExpression',
                    left : assignmentExpression.expression.left,
                    context : assignmentExpression 
                }
            }
        }
        if(assignmentExpression.expression.type === "CallExpression"){
            return {
                parentType : 'MemberExpression',
                type : 'CallExpression',
                left : assignmentExpression.expression.callee,
                context : assignmentExpression,
            }
        }
    }
    if(assignmentExpression.type === 'AssignmentExpression'){
        if(assignmentExpression.operator === '='){
            return { 
                parentType : 'MemberExpression',
                type : 'AssignmentExpression' ,
                left : assignmentExpression.left ,
                context : assignmentExpression 
            }
        } 
    }
    if(assignmentExpression.type === 'CallExpression'){
        return {
            parentType : 'MemberExpression',
            type : 'CallExpression',
            left : assignmentExpression.callee,
            context : assignmentExpression,
        }
    } 
    return false;
}
module.exports = isAssignmentExpression;