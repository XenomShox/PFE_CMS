const User = require("../models/user");
const Role = require("../models/role");
const Message = require("../models/messages");
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

    getUser = async function (req, res, next) {
        try {
            let user = await User.findById(req.params.user_id);
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    };

    createUser = function (req, res) {
        let { password, ...body } = req.body;

        User.register(new User({ ...body }), password, (err, user) => {
            if (err) {
                console.error(err);
                return res.render("LogIn");
            }
            passport.authenticate("Vinland strategy")(req, res, () => {
                res.redirect("/Admin");
            });
        });
    };
    updateUser = function (req, res) {
        console.log(req.body, req.params);
        User.updateOne({ _id: req.params.user_id }, req.body, (err, result) => {
            if (err) return res.status(400).send(err.message);
            res.redirect(req.header("Referer") || "/");
        });
    };
    updateUserTheme = function (req, res) {
        console.log(req.body, req.params);
        User.updateOne({ _id: req.params.user_id }, req.body, (err, result) => {
            if (err) return res.status(400).send(err.message);
            res.status(200).send("Success");
        });
    };

    logout = function (req, res) {
        req.logout();
        req.flash("success", "Logged you out!");
        res.redirect(req.header("Referer") || "/");
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

    asignRole = async function (req, res, next) {
        try {
            const { user_id, role_id } = req.params;
            let user = await User.findById(user_id);
            let role = await Role.findById(role_id);

            if (role.name === "Owner" && role.owner)
                return res.status(403).json({
                    error: {
                        message: "You are not authorized to do that",
                        code: 403,
                    },
                });

            if (!user.roles.some((r) => r.equals(role.id)))
                user.roles.push(role.id);

            await user.save();
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    };

    revokeRole = async function (req, res, next) {
        try {
            const { user_id, role_id } = req.params;
            let user = await User.findById(user_id);
            let role = await Role.findById(role_id);

            if (role.name === "Owner" && role.owner)
                return res.status(403).json({
                    error: {
                        message: "You are not authorized to do that",
                        code: 403,
                    },
                });

            if (user.roles.some((r) => r.equals(role.id)))
                user.roles.remove(role.id);

            await user.save();

            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    };

    renderContacts = async function (req, res, next) {
        try {
            let loggedUser = await User.findById(req.user._id).populate(
                "contacts",
                {
                    username: true,
                    profileImage: true,
                }
            );
            console.log(loggedUser);
            res.render("Blog(vinlandCMS)/Messenger.ejs", {
                contacts: loggedUser.contacts,
            });
        } catch (err) {
            next(err);
        }
    };

    renderChat = async (req, res, next) => {
        try {
            const { partner_id } = req.params;
            
            let loggedUser = await User.findById(req.user._id).populate(
                "messages",
                {
                    text: true,
                    sender: true,
                    receiver: true,
                }
            );
            let partnerUser = await User.findById(partner_id);

            const messages = loggedUser.messages.filter(
                (message) =>
                    message.sender.equals(partner_id) ||
                    message.receiver.equals(partner_id)
            );

            console.log(loggedUser);
            res.status(200).render(`templates/${req.Schema.name}/${req.Schema.Messenger}`, {
                messages,
                partnerUser,
            });
        } catch (err) {
            next(err);
        }
    };

    profile = async function (req, res) {
        let user = await User.findById(req.params.user_id);
        if (user) res.render(`templates/${req.Schema.name}/${req.Schema.Profile}`, { user });
        else res.redirect("/");
    };
}

module.exports = new UserMethods();
