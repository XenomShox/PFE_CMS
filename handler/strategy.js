const User = require("../models/user");
exports.customLocalStrat = async function (username, password, done) {
    try {
        let user = await User.findOne({ username });
        if (!user) return done(null, false);
        if (!user.authenticate(password)) return done(null, false);
        if (user.getIsBanned()) {
            if (user.banExpired()) {
                user.unbanUser();
                await user.save();
            } else return done(null, false);
        }
        return done(null, user);
    } catch (err) {
        done(err);
    }
};
