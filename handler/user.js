const User = require("../models/user");
const passport = require("passport");

// exports.renderSignup = function (req, res) {
//     res.render("signup");
// };

exports.renderLogin = function (req, res) {
    res.render("LogIn");
};

exports.getUsers = async function (req, res, next) {
    try {
        let users = await User.find({});
        console.log(users);

        res.send(users);
    } catch (err) {
        next(err);
    }
};

exports.createUser = function (req, res) {
    console.log(req.body);
    let { password, ...body } = req.body;

    User.register(new User({ ...body }), password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render("LogIn");
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/Admin");
        });
    });
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect("/user/login");
};

// PUT - /user/ban/:user_id/:days
exports.banUser = async function (req, res, next) {
    try {
        days = Number(req.body.days);
        let user = await User.findById(req.params.user_id);
        user.setBan(days);
        await user.save();
        res.redirect("/admin");
    } catch (err) {
        next(err);
    }
};

// PUT - /user/unban/:user_id
exports.unbanUser = async function (req, res, next) {
    try {
        let user = await User.findById(req.body.user_id);
    } catch (err) {
        next(err);
    }
};
