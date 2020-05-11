const User = require("../models/user");
const passport = require("passport");

exports.renderLogin = function (req, res) {
    res.render("LogIn");
};

<<<<<<< HEAD
exports.getUsers = async function (req, res, next) {
    try {
        let users = await User.find({});

        res.send(users);
    } catch (err) {
        next(err);
    }
};

=======
>>>>>>> b5133de3e974d762b1e726110f1d8637b5e312f8
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
    req.flash("success", "Logged you out!");
    res.redirect("/user/login");
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
