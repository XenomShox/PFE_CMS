const mongoose = require("mongoose");
class CommentsManager {
    /*----------------Attributes------------*/
    model;
    constructor() {
        this.model=mongoose.model("Vinland_Comments",{
            text:String,
            User:{type:mongoose.Schema.ObjectId},
            Post:{type:mongoose.Schema.ObjectId},
            //replied_To:null,
            //replay:[]//[comment]
        });
    }
    /*------------------Methods-------------*/
    Create(postId,commentID,userId,comment,callback){
        //succsess callback(200)
        // failed callback(400)
        //if(!commentID)//search for post add to post
        //else //add to comment replay
    }
}
module.exports = new CommentsManager();