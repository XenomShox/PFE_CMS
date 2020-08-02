const router = require('express').Router(),
    CategoriesManager=require("../Classes/CategoriesManager"),
    PostManager=require("../Classes/PostManager");
router.route('/*')
    .all((req,res,next)=> {
        let {pathname,query}=require('url').parse(req.url,true);
        req.URL=decodeURI(pathname);
        req.query=query;
        next();
    } )
    .get((req,res,next)=>{
        if (req.URL==="/") res.redirect("/");
        else if(req.query.post) next();  //post
        else
            CategoriesManager.GetCategory(req.URL.substr(1),(status,category)=>{
                res.locals.WebSite.Title+=" - "+category.Name;
                if(status===200){
                    if(req.query.create) res.render("Categories/CreatePost",{
                            Category:category
                        });
                    else {
                        PostManager.GetPosts({
                            category:category,
                            sort:req.query.sort,
                            limit:req.query.limit,
                            skip:req.query.skip
                        },(status,posts)=>{
                            if(status===200)res.status(200).render("Categories/Category1",{
                                Category:category,
                                Posts:posts
                            });
                            else next();
                        })
                    }
                }
               else next();
            });
    })
    .get((req, res, next) => {
        res.status(404).render("Categories/error",{
            message:"Couldn't Find this Categories"
        });
    })
    .post((req,res)=>{
        if(!req.Categories) res.status(400).send("Bad Request");
        else CategoriesManager.CreateCategory({
            Slug:req.URL,
            Name:req.Categories.pop(),
            Description:"Some Random Temp Description",
            Posts:[]
        },(status,message)=>{res.status(status).send(message);});
    })
module.exports = router;
