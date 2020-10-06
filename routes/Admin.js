const router = require("express").Router(),
    WebSite = require("../Classes/WebSite"),
    TemplatesManager = require("../Classes/TemplatesManager"),
    FileManager = require("../Classes/FileManager");
router.route("/").get((req, res) => {
    res.render("Admin/index", { url: "/Admin/dashboard" });
});
router
    .route("/:Admin")
    .get((req, res) => {
        if (req.query.f)
            res.render("Admin/" + req.params.Admin, (err, html) => {
                if (err)
                    res.status(404).render("Admin/error", {
                        pageName: req.params.Admin,
                        path: "/Admin/",
                        error: err,
                    });
                else res.send(html);
            });
        else res.render("Admin/index", { url: "/Admin/" + req.params.Admin });
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

router
    .route("/templates/route")
    .get((req, res) => {
        TemplatesManager.getTemplates()
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((reason) => {
                res.status(500).json(reason);
            });
    })
    .post((req, res) => {
        TemplatesManager.addTemplateFromZip(req.body.path)
            .then((data) => {
                res.status(200).send(data);
            })
            .catch((reason) => {
                res.status(500).send(reason.message);
            });
    })
    .put((req, res) => {
        TemplatesManager.applyTemplate(req.body.id)
            .then(() => {
                res.status(200).send("Template is applied");
            })
            .catch((reason) => {
                res.status(500).send(reason.message);
            });
    })
    .delete((req, res) => {
        TemplatesManager.removeTemplate(req.body.id)
            .then(() => {
                res.status(200).send("Template has been deleted");
            })
            .catch((reason) => {
                res.status(500).send(reason.message);
            });
    });
router
    .route("/templates/:id")
    .get(async (req, res) => {
        try {
            if (req.query.load) {
                return FileManager.ReadFile(req.query.load).then((file) => {
                    res.status(200).send(file);
                });
            }
            let template = await TemplatesManager.getTemplate(req.params.id);
            if (req.query.tree) {
                return FileManager.GetFilesTree(
                    `/${req.query.tree}/${template.name}`,
                    (status, result) => {
                        res.status(status).send(result);
                    },
                    false
                );
            }
            if (req.query.f) {
                return res.render(
                    "template/Edit",
                    { template },
                    (err, html) => {
                        if (err) throw err;
                        res.status(200).send(html);
                    }
                );
            }
            res.render(
                "Admin/index",
                { url: "/Admin/templates/" + req.params.id },
                (err, html) => {
                    if (err) throw err;
                    res.status(200).send(html);
                }
            );
        } catch (e) {
            console.error(e);
            res.status(404).render("Admin/error", {
                pageName: "Template",
                path: "/Admin/",
            });
        }
    })
    .put((req, res, next) => {
        try {
            if (req.query.update) {
                return FileManager.WriteFile(
                    req.query.update,
                    req.body.data
                ).then(() => {
                    res.status(200).send("File Saved");
                });
            }
            throw new Error("bad request");
        } catch (e) {
            res.status(400).send(e.message);
        }
    });
module.exports = router;
