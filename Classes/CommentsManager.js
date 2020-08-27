const mongoose = require("mongoose");
class CommentsManager {
    /*----------------Attributes------------*/
    model;
    constructor() {
        this.model=mongoose.model("Vinland_Comments",{

        });
    }
    /*------------------Methods-------------*/
    Create(postId,comment,callback){
        //succsess callback(200)
        // failed callback(400)
    }
}
module.exports = new CommentsManager();