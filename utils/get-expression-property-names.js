

/**
    var is = [
        nodePath.parentPath.get('object').isIdentifier({ name : 'module' }) ,
        nodePath.parentPath.get('prpperty').isIdentifier({ name : 'exports'}),
        nodePath.parentPath.get('object').isIdentifier({ name : 'exports'}),
    ];  
 * @param {*} node 
 * @returns 
 */
function getPeroperty(node){
    var p = node; 
    var counter = 0;
    var name = [];
    while(p !== undefined){
        if(p.object ){  
            if(p.property.name){
                name.push(p.property.name)
            }
            if(p.object.name){
                name.push(p.object.name);
            } 
            p = p.object
        }
        else {
            p = p.object;  
        } 
        counter ++;
    } 
    return [ name.reverse() , counter ];
}
module.exports = getPeroperty;