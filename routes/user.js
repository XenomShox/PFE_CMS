const router = require("express").Router();
const passport = require("passport");

const Message = require("../models/messages");
const User = require("../models/user");
const Role = require("../models/role");

const userMethods = require("../handler/user");

// Middlewares
const { isLoggedIn } = require("../middlewares/middleware");

router.get("/", userMethods.getUsers);

router.route("/ban/:user_id").put(userMethods.banUser);
router.route("/unban/:user_id").put(userMethods.unbanUser);

// Chat Section
router.route("/chat").get(async (req, res, next) => {
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
});
router.route("/chat/:partner_id").get(async (req, res, next) => {
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
        res.status(200).render("Blog(vinlandCMS)/Messages.ejs", {
            messages,
            partnerUser,
        });
    } catch (err) {
        next(err);
    }
});

// Roles Section
router.get("/role/:user_id", async (req, res, next) => {
    try {
        let roles = await Role.find();
        let user = await User.findById(req.params.user_id);
        res.render("Admin/Roles.ejs", { user, roles });
    } catch (err) {
        next(err);
    }
});

router.route("/role/:user_id/:role_id").post(async (req, res, next) => {
    try {
        const { user_id, role_id } = req.params;
        let user = await User.findById(user_id);
        let role = await Role.findById(role_id);

        if (!user.roles.some((r) => r.equals(role.id)))
            user.roles.push(role.id);

        await user.save();
        res.redirect(`/user/role/${req.params.user_id}`);
    } catch (err) {
        next(err);
    }
});
router.delete("/role/delete/:user_id/:role_id", async (req, res, next) => {
    try {
        const { user_id, role_id } = req.params;
        let user = await User.findById(user_id);
        let role = await Role.findById(role_id);

        if (user.roles.some((r) => r.equals(role.id)))
            user.roles.remove(role.id);

        await user.save();

        res.redirect(200, `/user/role/${req.params.user_id}`);
    } catch (err) {
        next(err);
    }
});

// User Profile
router.route("/profile/:user_id").get(userMethods.profile);

router.get("/:user_id", userMethods.getUser);

module.exports = router;
