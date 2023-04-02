'use strict'; 
module.exports = function ({ template , types : t } ,{opts}){
    


    return { 
        pre(state){
            //state.scope
            //state.scope.globals
            //state.scope.plugins  
        },
        visitor : { 
            MemberExpression(node_path , { opts }){
                const { length = Infinity , pattern = String("") } = opts ; 
                const { node , scope } = node_path;
                const { parent } = node_path; 
                if(t.isAssignmentExpression(parent)){
                    const { operator  , right , left } = parent ;
                    const { object , property  } = parent.left; 
                    const { value } = right ; 
                    function findAll( node ){
                        let name_list = [];
                        if(t.isIdentifier(node.object)){
                            name_list.push(node.object.name);
                            name_list.push(node.property.name)
                        }
                        else if(t.isMemberExpression(node.object)){
                            const object = node.object.object ;
                            const property = node.object.property;
                            const property_end = node.property;
                            if( object.name ){
                                name_list.push(object.name)
                            }
                            else if( object.name == undefined && object.object ){
                                name_list.push(...findAll(object)) 
                            }
                            name_list.push(property.name);
                            name_list.push(property_end.name);
                        }
                        return name_list;
                    }


                    const result = findAll(node);
                    const pattern_parsed = pattern.split(".").filter( i => i != ''); 
                    if( length !== Infinity && result.length > length ) return ;  
                    if( result.slice(0 , pattern_parsed.length ).join('.') !== pattern && pattern_parsed.length > 0 ) return ;
                    
                }

            } , 
        }, 
    };
};

