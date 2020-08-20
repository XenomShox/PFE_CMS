const mongoose = require('mongoose');
class PostManager {
    /*----------------Attributes------------*/
    #Model;
    /*------------------Methods-------------*/
    constructor() {
        let schema=mongoose.Schema({
            author:{type:mongoose.Schema.ObjectId,ref:"User"},
            date:{type:Date,default:new Date()},
            content:String,
            category:{type:mongoose.Schema.ObjectId,ref:"Vinland_Category"},
            comments:{type: [mongoose.Schema.ObjectId],ref:"comments"},
            comments_status:{
                type: String,
                enum : ["ALLOW" ,"HOLD","DISABLE"],
                default: 'ALLOW'
            },
            covers:{type:[String]},
            tags:[String],
            excerpt:String,
            modified_date:{type:Date,default:new Date()},
            rating:{
                likes:{
                    type:Number,
                    default:0
                },
                dislikes:{
                    type:Number,
                    default:0
                }
            },
            status:{
                type: String,
                enum : ["PRIVATE" ,"PUBLIC" ,"FUTURE", "DRAFT","PENDING","BLOCKED"],
                default: 'PUBLIC'
            },
            title:String,
            visited:{
                type:Number,
                default:0
            },
        });

        this.#Model=mongoose.model('Vinland_Post',schema);
    }
    CreatePost(post,callback){
        this.#Model.create(post,(err,res)=>{
            console.log(err)
            if(err) callback(500,"Internal Error");
            else callback(201,res);
        });
    }
    UpdatePost(Id,Post,callback){
        this.#Model.findOneAndUpdate(Id,Post,(err,res)=>{
            if(err) callback(500,"Internal Error");
            else callback(200,res);
        })
    }
    GetPosts(options,callback){
        let query;
        if(options){
            if(options.title) query=this.#Model.find({title:{ "$regex": options.title, "$options": "i" }});
            else if(options.category) query=this.#Model.find({category:options.category._id})
            else if(options.tag) query=this.#Model.find({tags:options.tag});
            else query=this.#Model.find({})
            if(options.sort) query.sort(options.sort);
            else query.sort("-date");
            if(options.limit) query.limit(options.limit);
            if(options.skip) query.skip(options.skip);
        }
        else{
            query=this.#Model.find({});
            callback=options;
        }
        query.select("-content")
            .populate("category")
            .populate("author",{username:1})
            .exec((err,res)=>{
                if(err) callback(500,"Internal error");
                else callback(200,res);
            })
    }
    GetPost(id,callback){
        this.#Model.findOneAndUpdate({_id:id},{$inc : {'visited' : 1}})
            .populate("author")
            .exec((err,res)=>{
           if(err)  callback(404,"Post Not Found");
           else callback(200,res);
        });
    }

}
module.exports = new PostManager();