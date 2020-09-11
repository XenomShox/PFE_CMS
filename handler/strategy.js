const User = require("../models/user");
exports.stratV1 = async function (username, password, done) {
    try {
        console.log(username);
        console.log(password);
        let user = await User.findOne({ username }).populate("roles", {
            owner: true,
            admin_privillage: true,
            create_post: true,
            delete_post: true,
        });
        if (!user) {
            console.log("User does not exist");
            return done(null, false);
        }
        // if (!user.authenticate(password)) {
        //     console.log("wrong password");
        //     return done(null, false);
        // }
        let authed = false;
        User.authenticate()(username, password, function (err, result) {
            if (err) {
                console.log(`err: ${err}`);
                return done(null, false);
            }
            console.log(`result: ${result}`);
            if (!result) {
                return done(null, false);
            }
        });
        if (user.getIsBanned()) {
            if (user.banExpired()) {
                user.unbanUser();
                await user.save();
            } else {
                console.log(
                    `${user.username} is banned for ${user.banned.duration} days`
                );
                return done(null, false);
            }
        }
        return done(null, user);
    } catch (err) {
        done(err);
    }
};

exports.stratV2 = async function (username, password, done) {
    try {
        let userDoc = await User.findOne({ username });
        let { user } = await User.authenticate()(username, password);
        // console.log(user);

        if (!user) {
            // console.log("incorrect username or password");
            return done(null, false, {
                message: "Incorrect username or password",
            });
        }

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
