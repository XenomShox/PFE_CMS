const router = require("express").Router();
const passport = require("passport");

// Helpers
const {
    createUser,
    renderLogin,
    getUsers,
    logout,

    banUser,
    unbanUser,

    profile,
} = require("../handler/user");

// Middlewares
const { isLoggedIn } = require("../middlewares/middleware");

router.get("/", getUsers);

router.post("/signup", createUser);

router
    .route("/login")
    .get(renderLogin)
    .post(
        passport.authenticate("local", {
            successRedirect: "/Admin",
            failureRedirect: "/user/login",
            failureFlash: true,
        })
    );

router.route("/logout").get(logout);

router.route("/ban/:user_id").put(banUser);
router.route("/unban/:user_id").put(unbanUser);
router.route("/profile").get(isLoggedIn, profile);

module.exports = router;
