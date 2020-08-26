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
                if (err)
                    res.status(404).render("Admin/error", {
                        pageName: req.params.Admin,
                        path: req.URL,
                    });
                else res.send(html);
            });
        else res.render("Admin/index", { url: "/Admin" + req.URL });
    })
    .post((req, res) => {
        WebSite.SaveDetails(req.body, (status, message) => {
            res.status(status).send(message);
        });
    });

module.exports = router;
