
module.exports = function getProgram(path) {
    if(path.isProgram()) return path;
    return path.findParent(function(parent){
        return parent.isProgram()
    }) 
}