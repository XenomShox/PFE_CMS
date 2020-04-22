const mongoose = require('mongoose');
module.exports = class Models {
    static #models = {};

    static get models() {
        return Models.#models;
    }

    /*------------------Methods-------------*/
    static LoadModels(iSchemas) {
        iSchemas.forEach((el) => {
            Models.#models[el.Name] = mongoose.model(el.Name, el.Schema);
        });
    }

    //

    /**
     * Fetching Data
     * @param {String} Name of the model
     * @param {Object} [Condition]
     * @param {function} [callback]
    * */
    static GetData(Name,Condition,callback){
        if(Models.#models[Name]!==undefined){
            if(Condition.find===undefined) Condition.find="{}";
            let query =Models.#models[Name].find(JSON.parse(Condition.find));
            if(Condition.select!==undefined) query.select(JSON.parse(Condition.select));
            if(Condition.limit!==undefined && !isNaN(Condition.limit)) {
                query.limit(Number(Condition.limit));
            }
            if(Condition.Sort!==undefined) query.sort(JSON.parse(Condition.Sort));
            if(Condition.skip!==undefined && !isNaN(Condition.skip)) query.skip(Number(Condition.skip));
            query.exec((err,result)=>{
                if(err) callback({Error:err});
                else if(Condition.Count!==undefined && JSON.parse(Condition.Count)) callback({Count:result.length});
                else callback(result);
            });


        }else{
            callback({Error:"this database '"+Name+"' Doesn't Exist"});
        }
    }

    /*
    static GetDataCount(Name,callback){
        let count={count:0};

    }*/

    //Adding  methods
    static AddModel(Name,Schema){
        Models.#models[Name]=mongoose.model(Name,Schema);
    }
    static AddData(Name,Data,callback){
        if(Models.#models[Name]===undefined){
            callback({Error:"Not Found"})
            return null;
        }else{
            return Models.#models[Name].create(Data,(err,res)=>{
                if(err){
                    if(err.code===11000)callback({Error:"Duplicated elements : "+Object.keys(err["keyValue"]),Duplicated:err["keyValue"]});
                    else callback({Error:"Couldn't Save"});
                }
                else callback(res);
            })
        }
    }

    //Update Methods
    static UpdateModel(Name,NewName,Schema) {
        if (Models.#models[Name] !== undefined) {
            Models.DeleteModel(Name);
            Models.AddModel(NewName, Schema);
        } else throw new Error("Model is undefined");
    }

    //Delete Methods
    static DeleteModel(Name){
        delete Models.#models[Name];
        delete mongoose.connection.models[Name];
    }
};