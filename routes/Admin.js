var express = require("express");
var router = express.Router();

/* GET Assets page. */
router.get("/", function (req, res) {
    res.render("Admin/index", { url: "/Admin/dashboard" });
});

router.get("/:Admin", function (req, res) {
    let Admin = require("url").parse(req.params.Admin).pathname;
    if (req.query.f !== undefined)
        res.render("Admin/" + Admin, (err, html) => {
            if (err)
                res.render("Admin/error", {
                    pageName: req.params.Admin,
                    path: Admin,
                });
            else res.send(html);
        });
    else res.render("Admin/index", { url: "/Admin/" + Admin });
});

module.exports = router;
