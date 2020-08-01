const mongoose=require("mongoose"),
    WebSite=require("./WebSite"),
    PostManager=require("./PostManager");
class CategoriesManager {
    /*----------------Attributes------------*/
    #CategoriesModel;
    /*------------------Methods-------------*/
    constructor() {
        this.#CategoriesModel=mongoose.model("Vinland_Category",{
            Name:String,
            Cover:String,
            Slug:{type:String,unique:true,dropDups:true,index:true},
            Description:String,
            Posts:{
                type:[mongoose.Schema.ObjectId],
                ref:"Vinland_Post"
            }
        })
        this.GetCategories((status,cats)=>{
            WebSite.LoadCategories(cats);
        })
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
    GetCategory(Slug,options,callback){
        this.#CategoriesModel.find({Slug:Slug},(err,Category)=>{
                if(err) return callback(500,"Internal Error");
                else if(Category.length===0) return callback(404,"Category not found");
                else{
                    PostManager.GetPostsFromCategory(Category[0],options,(status,category,posts)=>{
                        callback(200,category,posts);
                    })
                }
            });
    }
    AddPost(Slug,PostID,callback){

    }
}
module.exports = new CategoriesManager();
