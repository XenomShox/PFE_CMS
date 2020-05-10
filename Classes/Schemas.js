const mongoose = require('mongoose');
module.exports = class Schemas {
    /*----------------------------attribute-------------------------*/
    static #SchemaModel=mongoose.model('Schemas',mongoose.Schema({
        Name: {
            type:mongoose.Schema.Types.String,
            unique:true,
            dropDups:true,
            required:true,
            index: true
        },
        Schema: Object
    },{versionKey:false}));
    static #ApiManager;
    /*-----------------------------Methods-------------------------*/
    static async LoadSchemaSystem(ApiManager){
        await Schemas.#SchemaModel.init();
        Schemas.#ApiManager=ApiManager;
    }
    static GetAllSchemas(callback){
        return Schemas.#SchemaModel.find({},{Name:1,Schema:1,_id: 0 },(err,result)=>{
            if (err) callback(500, {Error: err});
            else callback(200, result);
        });
    }
    static GetASchema(Name,callback){
        Schemas.#SchemaModel.findOne({Name:Name},{Name:1,Schema:1,_id: 0 },(err,result)=>{
            if(!err){
                if (result !== null)
                    callback(200, result);
                else callback(404, {Error: "There is no Schema with this name : " + Name});
            }
            else
                callback(500, {Error: err});
        });
    }
    static AddASchema(Name,iSchema,callback){
        try {
            Schemas.#ApiManager.Models.AddModel(Name, iSchema);
            Schemas.#SchemaModel.create({Name: Name, Schema: iSchema}, (error) => {
                if (error) {
                    if (error.code === 11000) callback(409, {Error: "duplicate Name"});
                    else throw new Error(error);
                } else callback(201, {SUCCESS: "Created"});
            });
        } catch(e) {
            if (e.name === "TypeError") callback(400, {Error: "Invalid Schema"});
            else callback(500, {Error: e});
        }
    }
    static DeleteASchema(Name,callback){
        Schemas.#SchemaModel.deleteOne({Name:Name},(err,result)=> {
            if (err) callback(500, {Error: err})
            else if (result.n === 0) callback(404, {Error: `Couldn't find ${Name}`});
            else {
                callback(202, {SUCCESS: "DELETED"});
                Schemas.#ApiManager.Models.DeleteModel(Name);
            }
        });
    }
    static UpdateASchema(Name, NewName, iSchema, callback) {
        try {
            let Schema = new mongoose.Schema(iSchema);
            Schemas.#SchemaModel.replaceOne({Name: Name}, {Name: NewName, Schema: iSchema}, (error, result) => {
                if (error) {
                    if (error.code === 11000) callback(409, {Error: "duplicate Name"});
                    else callback(500, {Error: e});
                } else if (result.nModified === 0) callback(404, {Error: `Couldn't find ${Name} to Replace it with ${NewName}`});
                else {
                    Schemas.#ApiManager.Models.UpdateModel(Name, NewName, Schema);
                    callback(201, {SUCCESS: "UPDATED"});
                }
            });
        } catch (e) {
            if (e.name === "TypeError") callback(400, {Error: "Invalid schema"});
            else callback(500, {Error: e});
        }
    }
};