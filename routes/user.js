const router = require("express").Router();
const passport = require("passport");

const Message = require("../models/messages");
const User = require("../models/user");

// Helpers
// const {
//     createUser,
//     renderLogin,
//     getUsers,
//     logout,

//     banUser,
//     unbanUser,

//     profile,
// } = require("../handler/user");
const userMethods = require("../handler/user");

// Middlewares
const { isLoggedIn } = require("../middlewares/middleware");

router.get("/", userMethods.getUsers);

router.post("/signup", userMethods.createUser);

// router
//     .route("/login")
//     .get(userMethods.renderLogin)
//     .post(
//         passport.authenticate("local", {
//             failureRedirect: "/user/login",
//             failureFlash: true,
//         }),
//         (req, res) => {
//             console.log(req.body.to);
//             res.redirect(req.body.to);
//         }
//     );

// router.route("/logout").get(userMethods.logout);

router.route("/ban/:user_id").put(userMethods.banUser);
router.route("/unban/:user_id").put(userMethods.unbanUser);
router.route("/profile").get(isLoggedIn, userMethods.profile);
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
router.route("/chat/:partner_id/messages").get(async (req, res, next) => {
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

module.exports = router;
