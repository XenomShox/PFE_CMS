exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) return next();
    console.log("You must be Loged in to do that");
    req.flash("error", "Please Login First");
    res.status(400).redirect("/login");
};

exports.isAdmin = function (req, res, next) {
    if (req.user.role === "admin") return next();
    console.log("You must be admin to do that");
    req.flash("error", "You do not have permission to interact with admin dashboard");
    res.status(400).redirect("/");
};
