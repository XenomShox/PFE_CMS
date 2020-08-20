const User = require("../models/user");
const passport = require("passport");

class UserMethods {
    renderLogin = function (req, res) {
        res.render("LogIn", { to: req.header("Referer") || "/" });
    };

    getUsers = async function (req, res, next) {
        try {
            let users = await User.find({});

            res.send(users);
        } catch (err) {
            next(err);
        }
    };

    createUser = function (req, res) {
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

    logout = function (req, res) {
        req.logout();
        req.flash("success", "Logged you out!");
        res.redirect(req.header("Referer") || "/");
    };

    getUsers = async function (req, res, next) {
        try {
            let users = await User.find({});
            console.log(users);

            res.send(users);
        } catch (err) {
            next(err);
        }
    };

    // PUT - /user/ban/:user_id/:days
    banUser = async function (req, res, next) {
        try {
            var days = Number(req.body.days);
            let user = await User.findById(req.params.user_id);
            user.setBan(days);
            await user.save();
            res.status(200).json(user.banned);
        } catch (err) {
            res.status(500).json({ err });
        }
    };

    // PUT - /user/unban/:user_id
    unbanUser = async function (req, res, next) {
        try {
            let user = await User.findById(req.params.user_id);
            user.unbanUser();
            await user.save();
            res.status(200).json(user.banned);
        } catch (err) {
            res.status(500).json({ err });
        }
    };

    profile = async function (req, res) {
        let user = await User.findById(req.params.user_id)
        if(user) res.render("Blog(vinlandCMS)/Profile", {user});
        else res.redirect("/");
    };
}

module.exports = new UserMethods();
