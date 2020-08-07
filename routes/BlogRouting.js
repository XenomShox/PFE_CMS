const router = require("express").Router(),
    CategoriesManager = require("../Classes/CategoriesManager"),
    PostManager = require("../Classes/PostManager");
//app=require("../app");
console.log("BlogRouting");

router
    .route("/Categories")
    .get((req, res, next) => {
        res.redirect("/");
    })
    .post((req, res, next) => {
        //verify if he is an admin
        CategoriesManager.CreateCategory(
            {
                Slug: req.body.Slug,
                Name: req.body.Name,
                Description: req.body.Description,
                Posts: [],
            },
            (status, message) => {
                res.status(status).send(message);
            }
        );
    });
router
    .route("/Categories/*")
    .all((req, res, next) => {
        let { pathname, query } = require("url").parse(req.url, true);
        req.URL = decodeURI(pathname);
        console.log(req.URL);
        req.query = query;
        CategoriesManager.GetCategory(req.URL, (status, category) => {
            if (status === 200) {
                res.locals.Category = category;
                next();
            } else
                res.status(404).render("Categories/error", {
                    message: "Couldn't Find this Categories",
                });
        });
    })
    .get((req, res, next) => {
        if (req.query.post) PostHandler(req, res);
        //post
        else if (req.query.create) {
            res.locals.WebSite.Title += " - Create Post";
            res.render("Categories/CreatePost");
        } else CategoryHandler(req, res);
    })
    .post((req, res, next) => {
        if (res.locals.currentUser) {
            req.body.tags = req.body.tags.split(" ");
            if (!(req.body.covers instanceof Array))
                req.body.covers = [req.body.covers];

            PostManager.CreatePost(
                { ...req.body, author: res.locals.currentUser["_id"] },
                (status, post) => {
                    if (status === 201)
                        CategoriesManager.AddPost(
                            res.locals.Category["_id"],
                            post["_id"],
                            (status) => {
                                if (status === 201)
                                    res.redirect(
                                        "/categories/" +
                                            res.locals.Category.Slug
                                    );
                                else
                                    res.redirect(
                                        "/categories/" +
                                            res.locals.Category.Slug +
                                            "?create=true"
                                    );
                            }
                        );
                    else
                        res.status(status).render("Categories/error", {
                            message: "Couldn't Create Post",
                        });
                }
            );
        } else res.status(305).send("You can't create a post without LogIn");
    });
/*----------------Tag System-----------------*/
router.route("/tags/:tag").get((req, res, next) => {
    let { query } = require("url").parse(req.url, true);
    PostManager.GetPosts({ tag: req.params.tag, ...query }, (status, Posts) => {
        if (status === 200)
            res.status(200).render("Blog(vinlandCMS)/Tags", {
                Posts,
                tag: req.params.tag,
            });
        else res.status(status).render("Categories/error", { message: Posts });
    });
});
/*---------------Categories------------------*/
function CategoryHandler(req, res) {
    let category = res.locals.Category;
    res.locals.WebSite.Title += " - " + category.Name;
    PostManager.GetPosts({ category, ...req.query }, (status, posts) => {
        if (status === 200)
            res.status(200).render("Categories/Category1", { Posts: posts });
        else res.status(status).render("Categories/error", { message: posts });
    });
}
/*--------------Post-----------------*/
function PostHandler(req, res) {
    res.locals.WebSite.Title += " - " + res.locals.Category.Name;
    PostManager.GetPost(req.query.post, (status, Post) => {
        if (status === 200) {
            res.locals.WebSite.Title += " - " + Post.title;
            res.render("Posts/Post1", { Post });
        } else {
            res.locals.WebSite.Title += " - " + Post;
            res.render("Categories/error", { message: Post });
        }
    });
}
module.exports = router;
