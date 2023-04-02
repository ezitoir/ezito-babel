'use strict'; 
var hasSymbol = typeof Symbol === 'function' && Symbol.for;
module.exports.Import = {
    Default : hasSymbol ? Symbol.for('ezitoBabelTypes.Import.Default') : 0xeac7 ,
    WithCards : hasSymbol ? Symbol.for('ezitoBabelTypes.Import.WithCards') : 0xeacb ,
    Import : hasSymbol ? Symbol.for('ezitoBabelTypes.Import.Import') : 0xeaca,
}; 
module.exports.Export = {
    is(obj){
        if(typeof obj !== "object" || (typeof obj === "object" && !obj.$$typeOf)) return false;
        return true
    },
    isDefault(obj){
        if(exports.Export.is(obj)){
            return (
                obj instanceof exports.Export.Default 
            )
        }
    },
    isExport(obj){
        if(exports.Export.is(obj)){
            return (
                obj instanceof exports.Export.Export 
            )
        }
    },
    isWithFrom(obj){
        if(exports.Export.is(obj)){
            return (
                obj instanceof exports.Export.WithFrom 
            )
        }
    },
    isWithCards(obj){
        if(exports.Export.is(obj)){
            return (
                obj instanceof exports.Export.WithCards 
            )
        }
    },
    isVariable(obj){
        if(exports.Export.is(obj)){
            return (
                obj instanceof exports.Export.Variable 
            )
        }
    },
    Default : hasSymbol ? Symbol.for('ezitoBabelTypes.Export.Default') : 0xeacc ,
    WithCards : hasSymbol ? Symbol.for('ezitoBabelTypes.Export.WithCards') : 0xead2 ,
    Variable : hasSymbol ? Symbol.for('ezitoBabelTypes.Export.Variable') : 0xeacd,
    WithFrom : hasSymbol ? Symbol.for('ezitoBabelTypes.Export.WithFrom') : 0xeace,
    Export : hasSymbol ? Symbol.for('ezitoBabelTypes.Export.Export') : 0xead3,
};  