const router = require("express").Router();

const userMethods = require("../handler/user");

// Middlewares
const { isLoggedIn, hasPermission } = require("../middlewares/middleware");

router.get("/", isLoggedIn, hasPermission(["admin_privillage"]), userMethods.getUsers);

router
    .route("/ban/:user_id")
    .put(isLoggedIn, hasPermission(["admin_privillage"]), userMethods.banUser);
router
    .route("/unban/:user_id")
    .put(
        isLoggedIn,
        hasPermission(["admin_privillage"]),
        userMethods.unbanUser
    );

// Chat Section
// router.get("/chat", isLoggedIn, userMethods.renderContacts);
router.get("/chat/:partner_id", isLoggedIn, userMethods.renderChat);

router
    .route("/role/:user_id/:role_id")
    .post(
        isLoggedIn,
        hasPermission(["admin_privillage"]),
        userMethods.asignRole
    )
    .delete(
        isLoggedIn,
        hasPermission(["admin_privillage"]),
        userMethods.revokeRole
    );

// User Profile
router.get("/profile/:user_id", userMethods.profile);

router
    .route("/:user_id")
    .all(isLoggedIn)
    .get(hasPermission(["admin_privillage"]), userMethods.getUser)
    .post(userMethods.updateUser)
    .put(userMethods.updateUserTheme);

module.exports = router;