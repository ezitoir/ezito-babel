'use strict';
const { default : babelTemplate } = require('@babel/template');
const exportTypes = require('./all').Export;


function Default(){
    return {
        $$typeOf : exportTypes.Default ,
        template(str){
            
        }
    }
}

module.exports.Default = Default;