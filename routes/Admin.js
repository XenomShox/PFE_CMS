const router = require("express").Router(),
    { isLoggedIn, hasPermission } = require("../middlewares/middleware"),
    WebSite = require("../Classes/WebSite");

router.all("*", isLoggedIn, hasPermission(["admin_privillage"]));
router.route("/").get((req, res) => {
    res.render("Admin/index", { url: "/Admin/dashboard" });
});
router
    .route("/:Admin")
    .all((req, res, next) => {
        req.URL = decodeURI(require("url").parse(req.url).pathname);
        next();
    })
    .get((req, res) => {
        if (req.query.f !== undefined)
            res.render("Admin/" + req.params.Admin, (err, html) => {
                if (err){
                    console.log(err);
                    res.status(404).render("Admin/error", {
                        pageName: req.params.Admin,
                        path: "/Admin/",
                    });
                }
                else res.send(html);
            });
        else res.render("Admin/index", { url: "/Admin" + req.URL });
    })
    .post((req, res) => {
        let callback = (status, message) => {
            res.status(status).send(message);
        };
        switch (req.params.Admin) {
            case "General":
                return WebSite.SaveDetails(req.body, callback);
            case "DataBaseSettings":
                return WebSite.SaveSettings(req.body, callback);
            case "Writing":
                return WebSite.SaveEmail(req.body, callback);
            default:
                return callback(404, "Not Found");
        }
    });

module.exports = router;
