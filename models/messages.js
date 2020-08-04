const mongoose = require("mongoose");
const User = require("./user");

messageSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.pre("remove", async function (next) {
    try {
        let user1 = await User.findById(this.user1);
        let user2 = await User.findById(this.user2);

        user1.messages.remove(this.id);
        user2.messages.remove(this.id);

        await user1.save();
        await user2.save();

        return next();
    } catch (err) {
        return next(err);
    }
});

module.exports = mongoose.model("Message", messageSchema);
