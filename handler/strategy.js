const User = require("../models/user");
module.exports = async function (username, password, done) {
    try {
        let userDoc = await User.findOne({ username });
        if(!userDoc) return done(null, false, { message: "Incorrect username" });
        let { user } = await User.authenticate()(username, password);
        if (!user) return done(null, false, { message: "Incorrect password" });
        if (userDoc.getIsBanned()) {
            if (userDoc.banExpired()) {
                userDoc.unbanUser();
                await userDoc.save();
            } else {
                return done(null, false, {
                    message: `${
                        userDoc.username
                    } is banned from ${userDoc.banned.dateOfBan.getFullYear()}-${userDoc.banned.dateOfBan.getMonth()}-${userDoc.banned.dateOfBan.getDate()} for ${
                        userDoc.banned.duration
                    } days`,
                });
            }
        }
        return done(null, user);
    } catch (err) {
        done(err);
    }
};
