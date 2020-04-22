const User = require("../models/user");
const passport = require("passport");

// exports.renderSignup = function (req, res) {
//     res.render("signup");
// };

exports.renderLogin = function (req, res) {
    res.render("LogIn");
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
            res.redirect("/secret");
        });
    });
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect("/auth/login");
};
