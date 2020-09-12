const mongoose = require("mongoose");
const Post = require("./PostManager");
class CommentsManager {
    /*----------------Attributes------------*/
    model;
    constructor() {
        let commentSchema = new mongoose.Schema({
            text: String,
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "Vinland_User",
            },
            post: {
                type: mongoose.Schema.ObjectId,
                ref: "Vinland_Post",
            },
            replied_to: {
                type: mongoose.Schema.ObjectId,
                ref: "Vinland_Comments",
            },
            replies: [
                {
                    type: mongoose.Schema.ObjectId,
                    ref: "Vinland_Comments",
                },
            ],
        });
        this.model = mongoose.model("Vinland_Comments", commentSchema);
    }
    /*------------------Methods-------------*/
    async Create(post, options, callback) {
        try {
            let newComment = await this.model.create({ post, ...options });

            if (options.replied_to) {
                let repliedTo = await this.model.findById(options.replied_to);
                console.log(repliedTo);
                repliedTo.replies.push(newComment.id);
                await repliedTo.save();
            } else {
                let postToFind = await Post.Model.findById(post);
                console.log(postToFind);
                postToFind.comments.push(newComment.id);
                await postToFind.save();
            }
            callback(200, newComment);
        } catch (err) {
            callback(500, err.message);
        }
    }
    async Delete(commentId, callback) {
        try {
            console.log(commentId);

            let commentToRemove = await this.model.findById(commentId);

            if (commentToRemove.replied_to) {
                let replied_toDoc = await this.model.findById(
                    commentToRemove.replied_to
                );
                replied_toDoc.replies.remove(commentToRemove.id);
                await replied_toDoc.save();
            } else {
                for (let i = 0; i < commentToRemove.replies.length; i++) {
                    let reply = await this.model.findById(
                        commentToRemove.replies[i]
                    );
                    await reply.remove();
                }
                let post = await Post.Model.findById(commentToRemove.post);
                post.comments.remove(commentToRemove.id);
                await post.save();
            }
            await commentToRemove.remove();
            callback(200, commentToRemove);
        } catch (err) {
            callback(500, err.message);
        }
    }
    async Modify(commentId, text, callback) {
        try {
            let commentToUpdate = await this.model.findById(commentId);
            commentToUpdate.text = text;

            await commentToUpdate.save();
            callback(200, commentToUpdate);
        } catch (err) {
            callback(500, err.message);
        }
    }
}
module.exports = new CommentsManager();
