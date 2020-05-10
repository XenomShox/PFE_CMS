exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/user/login");
};

// exports.isBanned = function(req, res, next){
//     if (res.locals.currentUser)
// }