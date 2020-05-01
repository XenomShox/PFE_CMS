const mongoose = require('mongoose');

function ErrorHundle(err,callback) {
    if(err.code===11000) callback(409,{Error:"Duplicated elements : "+Object.keys(err["keyValue"]),Duplicated:err["keyValue"]});
    else if(err.errors!==undefined){
        let merr=[];
        for(let key in err.errors) if(err.errors.hasOwnProperty(key)) merr.push(err.errors[key].message);
        callback(500,{Error:merr});
    }else{
        callback(500,{Error:err.message});
    }
}

module.exports = class Models {
    static #models = {};
    static LoadModels(iSchemas) {
        iSchemas.forEach((el) => {
            Models.#models[el.Name] = mongoose.model(el.Name, el.Schema);
        });
    }
    /*------------------Models Methods-------------*/
    static AddModel(Name,Schema){
        Models.#models[Name]=mongoose.model(Name,Schema);
    }
    static UpdateModel(Name,NewName,Schema) {
        if (Models.#models[Name] !== undefined) {
            Models.DeleteModel(Name);
            Models.AddModel(NewName, Schema);
        } else throw new Error("Model is undefined");
    }
    static DeleteModel(Name){
        delete Models.#models[Name];
        delete mongoose.connection.models[Name];
    }
    /*------------------Data Methods-------------*/
    static GetData(Name,Condition,callback){
        if(Models.#models[Name]===undefined) callback(404,{Error:`${Name}: database collection doesn't Exist`});
        else Models.#models[Name].find(
            Condition.find===undefined?{}:Condition.find,
            Condition.select!==undefined?Condition.select:null,
            {
                ...Condition.limit!==undefined?{limit:Condition.limit}:undefined,
                ...Condition.sort!==undefined?{sort:Condition.sort}:undefined,
                ...Condition.skip!==undefined?{skip:Condition.skip}:undefined
            },
            (err,result)=>{
                if(err) callback(500,{Error:err});
                else callback(200,{result:result,...Condition.count!==undefined && Condition.count?{count:result.length}:undefined});
            }
        );
    }
    static AddData(Name,Data,callback){
        if(Models.#models[Name]===undefined) callback(404,{Error:`${Name}: database collection doesn't Exist`});
        else Models.#models[Name].create(Data,(err,res)=>{
            if(err){
                ErrorHundle(err,callback);
            }
            else callback(201, {SUCCESS:`Successfully created`,'_id':res['_id']});
        });
    }
    static DeleteData(Name,id,callback){
        if(id===undefined) callback(406,{Error:"id doesn't exist"});
        else if(Models.#models[Name]===undefined) callback(404,{Error:`${Name}: database collection doesn't Exist`});
        else Models.#models[Name].findByIdAndDelete(id,(err)=>{
                if(err) callback(500,{Error:err});
                else callback(202,{SUCCESS:`${id} Successfully deleted`});
            });
    }
    static UpdateData(Name,id,Data,callback){
        if(id===undefined) callback(409,{Error:"we can't Update this data without id"});
        else if(Models.#models[Name]===undefined) callback(404,{Error:`${Name}: database collection doesn't Exist`});
        else Models.#models[Name].updateOne({'_id':id},Data,(err,res)=>{
            if(err){
                ErrorHundle(err,callback);
            }
            else if(res.n===0) callback(404,{Error:`Can't find this id ${id}`});
            else if(res.nModified===0) callback(400,{Error:'Data Types doesnt follow the Schema of this module'});
            else callback(201, {SUCCESS:`Successfully Updated`});
        });
    }
};