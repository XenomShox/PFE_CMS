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

    User.register(new User({ ...body }), password, (err) => {
        if (err) {
            return res.render("LogIn",{Error:err});
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/Admin");
        });
    });
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect("/auth/login");
};
