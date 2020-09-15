const mongoose = require("mongoose");
const User = require("./user");

messageSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        sender: { type: mongoose.Schema.ObjectId, ref: "Vinland_User" },
        receiver: { type: mongoose.Schema.ObjectId, ref: "Vinland_User", },
    }, { timestamps: true, }
);

messageSchema.pre("remove", async function (next) {
    try {
        let [ sender , receiver ] = await Promise.all( [
                                                           User.findById( this.sender ) , User.findById( this.receiver ),
                                                       ] );
        sender.messages.remove(this.id);
        receiver.messages.remove(this.id);
        await Promise.all([sender.save(),receiver.save()] )
        return next();
    } catch (err) {
        return next(err);
    }
});

module.exports = mongoose.model("Vinland_Message", messageSchema);
