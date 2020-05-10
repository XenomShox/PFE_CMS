const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin']
    },
    password: {
        type: String,
    },
    birthday: {
        type: Date,
        required: true,
    },
    phone: String,
    profileImage: {
        type: String,
    },
});

userSchema.pre("save", async function (next) {
    try {
        if (this.isNew && !this.profileImage)
            this.profileImage =
                "https://www.sackettwaconia.com/wp-content/uploads/default-profile.png";
        if (this.isNew && (!this.role || this.role === 'admin')) this.role = 'user';
        return next();
    } catch (err) {
        return next(err);
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
