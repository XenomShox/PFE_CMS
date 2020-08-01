const router = require("express").Router(),
    CategoriesManager = require("../Classes/CategoriesManager");
const { isLoggedIn, isAdmin } = require("../middlewares/middleware");
router
    .route("/*")
    .all((req, res, next) => {
        let { pathname, query } = require("url").parse(req.url, true);
        req.URL = decodeURI(pathname);
        req.query = query;
        next();
    })
    .get((req, res, next) => {
        console.log(req.URL, req.query);
        if (req.URL === "/") res.redirect("/");
        else if (req.query.post) next();
        //post
        else
            CategoriesManager.GetCategory(
                req.URL.substr(1),
                {
                    sort: req.query.sort,
                },
                (status, category, posts) => {
                    res.locals.WebSite.Title += " - " + category.Name;
                    switch (status) {
                        case 200:
                            {
                                if (req.query.create)
                                    res.render("Categories/CreatePost", {
                                        Category: category,
                                    });
                                else
                                    res.status(200).render(
                                        "Categories/Category1",
                                        {
                                            Category: category,
                                            Posts: posts,
                                        }
                                    );
                            }
                            break;
                        case 500:
                        case 404:
                            res.status(404).render("Categories/error", {
                                message: category,
                            });
                            break;
                    }
                }
            );
    })
    .post((req, res) => {
        if (!req.Categories) res.status(400).send("Bad Request");
        else
            CategoriesManager.CreateCategory(
                {
                    Slug: req.URL,
                    Name: req.Categories.pop(),
                    Description: "Some Random Temp Description",
                    Posts: [],
                },
                (status, message) => {
                    res.status(status).send(message);
                }
            );
    });
module.exports = router;
