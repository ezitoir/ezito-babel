'use strict';
const { default : prepareAddSourceFunction } = require('ezito-babel/utils/add-source');
 

module.exports = function ({ template , types : t } ,{opts}){  
    return { 
        visitor : {
            Program : {
                exit(nodePath ,{ opts , file }) { 
                    if(typeof opts !== 'object') return ;
                    if(typeof opts.prepareAddSource !== 'function') return;
                    const fileName = file.opts.filename || opts.fileName ;
                    const declarationSource = opts.prepareAddSource.call(this , nodePath , fileName);
                    if(!(declarationSource instanceof Array)) return ;
                    let declarationReversSource = declarationSource.reverse() ;
                    for (const source of declarationReversSource) { 
                        prepareAddSourceFunction(nodePath,template,t,source,opts.option);
                    } 
                },
                enter(nodePath ,{ opts , file }) { 
                     
                }
            }
        },
    };
};