const router = require("express").Router();
const passport = require("passport");

// Helpers
const {
    renderSignup,
    createUser,
    renderLogin,
    logout,
} = require("../handler/auth");

router.post("/signup", createUser);

router
    .route("/login")
    .get(renderLogin)
    .post(
        passport.authenticate("local", {
            successRedirect: "/Admin",
            failureRedirect: "/auth/login",
        })
    );

router.route("/logout").get(logout);

module.exports = router;
