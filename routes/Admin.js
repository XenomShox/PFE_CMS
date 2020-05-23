var express = require("express");
var router = express.Router();

/* GET Assets page. */
router.get("/", function (req, res) {
    res.render("Admin/index", { url: "/Admin/dashboard" });
});
router.get("/:Admin", function (req, res) {
    if (req.query.f !== undefined)
        res.render("Admin/" + req.params.Admin, (err, html) => {
            if (err)
                res.render("Admin/error", {
                    pageName: req.params.Admin,
                    path: require("url").parse(req.originalUrl).pathname,
                });
            else res.send(html);
        });
    else res.render("Admin/index", { url: "/Admin/" + req.params.Admin });
});
router.get("*", function (req, res) {
    res.render("Admin/error", {
        pageName: req.params.Admin,
        path: require("url").parse(req.originalUrl).pathname,
    });
});

module.exports = router;
