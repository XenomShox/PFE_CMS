const mongoose = require("mongoose");
const User = require("./user");

messageSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        receiver: {
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
        let sender = await User.findById(this.sender);
        let receiver = await User.findById(this.receiver);

        sender.messages.remove(this.id);
        receiver.messages.remove(this.id);

        await sender.save();
        await receiver.save();

        return next();
    } catch (err) {
        return next(err);
    }
});

module.exports = mongoose.model("Vinland_Message", messageSchema);
