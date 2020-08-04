
const mongoose=require("mongoose"),
    WebSite=require("./WebSite");
class CategoriesManager {
    /*----------------Attributes------------*/
    #CategoriesModel;
    /*------------------Methods-------------*/
    constructor() {
        this.#CategoriesModel=mongoose.model("Vinland_Category",{
            Name:String,
            Cover:String,
            Slug:{type:String,unique:true,dropDups:true,index:true},
            Description:String
        })
        this.GetCategories((status,cats)=>{
            WebSite.LoadCategories(cats);
        })
    }
    GetCategoryByID(id,callback){
        this.#CategoriesModel.find({Posts:id},(err,Category)=>{
            if(err) return callback(500,"Internal Error");
            else if(Category.length===0) return callback(404,"Category not found");
            else callback(200,Category[0]);
        });
    }
    CreateCategory(Category,callback){
        this.#CategoriesModel.create(Category,(err)=>{
            if(err) return callback(500,"Couldn't create this Category");
            callback(201,"Category have been Created");
        });
    }
    GetCategories(callback){
        this.#CategoriesModel.find({},(err,Category)=>{
            if(err) return callback(404,"there is no Category");
            else callback(200,Category);
        });
    }
    GetCategory(Slug,callback){
        this.#CategoriesModel.find({Slug:Slug},(err,Category)=>{
            if(err) return callback(500,"Internal Error");
            else if(Category.length===0) return callback(404,"Category not found");
            else callback(200,Category[0]);
        });
    }
    AddPost(Id,PostID,callback){
        this.#CategoriesModel.updateOne({"_id":Id},{$push: { Posts: PostID }},(err)=>{
            if(err) callback(500);
            else callback(201);
        })
    }
}
module.exports = new CategoriesManager();
