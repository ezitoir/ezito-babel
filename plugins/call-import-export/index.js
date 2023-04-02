 



const importVisitor = require('ezito-babel/plugins/import').visitor;
const callFunctionVisitor = require('ezito-babel/plugins/call-function').visitor;
const exportVisitor = require('ezito-babel/plugins/export').visitor;
 
const CallImportExport = function ({ template , types : t , opts} ,option){ 
    return {
        visitor : {
            ...importVisitor.create({ template , types : t } ,{opts}),
            ...callFunctionVisitor.create({ template , types : t } ,{opts}),
            ...exportVisitor.create({ template , types : t } ,{opts}),
        }
    }
}
module.exports = CallImportExport;