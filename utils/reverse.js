
module.exports = function reverse(object){
    if( typeof object !== 'object' && Object.prototype.toString(object) !== '[Object object]' && object.constructor !== Object.prototype.constructor) return ;

    let keys = Object.keys(object).reverse();
    let values = Object.values(object).reverse();
    let new_object = Object();
    keys.forEach(function( key , index ){
        new_object[ key ] = values.at( index );
    });
    return new_object
}
