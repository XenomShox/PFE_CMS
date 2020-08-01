const router = require("express").Router();
const passport = require("passport");

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

router
    .route("/login")
    .get(userMethods.renderLogin)
    .post(
        passport.authenticate("local", {
            failureRedirect: "/user/login",
            failureFlash: true,
        }),
        (req, res) => {
            console.log(req.body.to);
            res.redirect(req.body.to);
        }
    );

router.route("/logout").get(userMethods.logout);

router.route("/ban/:user_id").put(userMethods.banUser);
router.route("/unban/:user_id").put(userMethods.unbanUser);
router.route("/profile").get(isLoggedIn, userMethods.profile);

module.exports = router;
