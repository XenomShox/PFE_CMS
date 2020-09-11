const User = require("../models/user");

exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) return next();
    console.log("You must be Loged in to do that");
    req.flash("error", "Please Login First");
    res.status(400).redirect("/login");
};

// ["admin", "create", "delete"]
exports.hasPermission = (permissions) => {
    return async (req, res, next) => {
        try {
            let user = await User.findById(req.user.id).populate("roles");
            if (
                user.roles.some((role) => role["owner"]) ||
                user.roles.some((role) => role["admin_privillage"])
            )
                return next();

            permissions.forEach((permission) => {
                if (!user.roles.some((role) => role[permission])) {
                    console.log("You are not Authorized");
                    req.flash("error", "Not Authorized");
                    res.redirect("/");
                }
            });
            return next();
        } catch (err) {
            return next(err);
        }
    };
};
