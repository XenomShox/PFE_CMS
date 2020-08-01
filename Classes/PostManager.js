const mongoose = require('mongoose');
class PostManager {
    /*----------------Attributes------------*/
    #Model
    /*------------------Methods-------------*/
   /* SetModel(contentType){
        if(contentType) this.#Schema.content=contentType;
        this.#Model=
    }*/
    constructor() {
        this.#Model=mongoose.model('Vinland_Post',{
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
    GetPostsFromCategory(Category,options,callback){
        let query=this.#Model.find({_id:{"$in":Category.Posts}});
        if(options.sort)query.sort(options.sort);
        if(options.limit)query.limit(options.limit);
        query.exec((err,res)=>{
            if(err) callback(500,"Couldn't find the posts");
            else callback(200,Category,res);
        });
    }
    CreatePost(post,callback){
        this.#Model.create(post,callback);
    }
}
module.exports = new PostManager();