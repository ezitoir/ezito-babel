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
                    right : assignmentExpression.expression.right,
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
                right : assignmentExpression.right
            }
        }
    }
    if(assignmentExpression.type === 'AssignmentExpression'){
        if(assignmentExpression.operator === '='){
            return { 
                parentType : 'MemberExpression',
                type : 'AssignmentExpression' ,
                left : assignmentExpression.left ,
                right : assignmentExpression.right ,
                context : assignmentExpression 
            }
        } 
    }
    if(assignmentExpression.type === 'CallExpression'){
        return {
            parentType : 'MemberExpression',
            type : 'CallExpression',
            left : assignmentExpression.callee,
            right : nodePath.parentPath.right ,
            context : assignmentExpression,
        }
    } 
    return false;
}
module.exports = isAssignmentExpression;