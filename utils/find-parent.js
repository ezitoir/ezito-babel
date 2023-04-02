module.exports = function getProgram(path) {
    return path.findParent(function(parent){
        return parent;
    }) 
}