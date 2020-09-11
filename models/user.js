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
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
        },
    ],
    password: {
        type: String,
    },
    birthday: {
        type: Date,
        required: true,
    },
    banned: {
        isBanned: Boolean,
        dateOfBan: Date,
        duration: Number,
    },
    phone: String,
    profileImage: {
        type: String,
    },
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
    ],
    contacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    Admin: {
        LogoHeader: { type: String, default: "dark" },
        NavbarHeader: { type: String, default: "dark" },
        Background: { type: String, default: "dark" },
        Sidebar: { type: String, default: "dark" },
        layout: { type: String, default: "dark" },
    },
});

userSchema.pre("save", async function (next) {
    try {
        if (this.isNew) {
            if (!this.profileImage)
                this.profileImage =
                    "https://www.sackettwaconia.com/wp-content/uploads/default-profile.png";

            this.banned.isBanned = false;
            this.banned.dateOfBan = undefined;
            this.banned.duration = undefined;
        }

        return next();
    } catch (err) {
        return next(err);
    }
});

userSchema.methods.getIsBanned = function () {
    return this.banned.isBanned;
};

userSchema.methods.setBan = function (days) {
    if (!this.banned.isBanned) {
        this.banned.isBanned = true;
        this.banned.dateOfBan = new Date();
        this.banned.duration = days;
        console.log("user banned");
    } else {
        console.log("user already banned");
    }
};

userSchema.methods.unbanUser = function () {
    if (this.banned.isBanned) {
        this.banned.isBanned = false;
        this.banned.dateOfBan = undefined;
        this.banned.duration = undefined;
    } else {
        console.log("user already not banned");
    }
};

userSchema.methods.banExpired = function () {
    let now = new Date();
    let diffInDays =
        (now.getTime() - this.banned.dateOfBan.getTime()) / (1000 * 3600 * 24);
    return diffInDays >= this.banned.duration;
};

userSchema.plugin(passportLocalMongoose, { populateFields: "roles contacts" });

module.exports = mongoose.model("User", userSchema);
