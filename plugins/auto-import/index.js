 
const isVariableDefined = require('ezito-babel/utils/is-variable-defined');
const getProgram = require('ezito-babel/utils/get-program');
const {default : importName}  = require('ezito-babel/utils/import');
 
const visitor = {
    create({ template , types },{opts}){
        return {
            Program( nodePath ,{ opts , file }){ 
                let { node , scope } = nodePath;   
                if(typeof opts !== 'object') return ;
                if(typeof opts.prepareAutoImport !== 'function') return;
                const fileName = file.opts.filename || opts.fileName ;
                const declarationVaribale = opts.prepareAutoImport.call(this , nodePath , fileName);
                if(!(declarationVaribale instanceof Array)) return ;
                for (const iterator of declarationVaribale) {
                    const { name , path , member } = iterator;
                    importName(nodePath, types ,name, path , member) 
                } 
            }
        }
    }
};

const autoImport = function autoImport({ template , types },{opts}){
    return { visitor : visitor.create({ template , types },{opts}) } 
}
autoImport.prototype.visitor = visitor;
module.exports = autoImport;