const mongoose = require('mongoose');
class PostManager {
    /*----------------Attributes------------*/
    #Model;
    #Schema;
    /*------------------Methods-------------*/
   /* SetModel(contentType){
        if(contentType) this.#Schema.content=contentType;
        this.#Model=
    }*/
    constructor() {
        this.#Model=mongoose.model('Vinland_Post',{
            author:{type:mongoose.Schema.ObjectId,ref:"User"},
            date:{type:Date,default:new Date()},
            content:String,
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
    }
    CreatePost(post,callback){
        this.#Model.create(post,(err)=>{
            if(err) callback(500,"Internal Error");
            else callback(201,"Posted");
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
            if(options.category) query=this.#Model.find({_id:{"$in":options.category.Posts}})
            else query=this.#Model.find({})
            if(options.sort) query.sort(options.sort);
            if(options.limit) query.limit(options.limit);
            if(options.skip) query.skip(options.skip);
        }else{
            query=this.#Model.find({});
            callback=options;
        }
        query.exec((err,res)=>{
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