const router = require('express').Router(),
    CategoriesManager=require("../Classes/CategoriesManager"),
    PostManager=require("../Classes/PostManager"),
    FilesManager= require('../Classes/FileManager'),
    multer=require("multer"),
    storage=multer.diskStorage({
        destination: function (req, file, cb) {
            req.FilePath="./files/";
            cb(null,req.FilePath);
        },
        filename: function (req, file, cb) {
            req.FileName=file.originalname+Date.now();
            cb(null, req.FileName);
        }
    }),
    upload=multer({storage}).array("covers",10);
router.route('/')
    .get((req, res, next) => {
        res.redirect("/");
    })
    .post((req, res, next) => {
        //verify if he is an admin
        CategoriesManager.CreateCategory({
            Slug:req.body.Slug,
            Name:req.body.Name,
            Description:req.body.Description,
            Posts:[]
        },(status,message)=>{res.status(status).send(message);});
    })
router.route('/*')
    .all((req,res,next)=> {
        let {pathname,query}=require('url').parse(req.url,true);
        req.URL=decodeURI(pathname);
        req.query=query;
        CategoriesManager.GetCategory(req.URL.substr(1),(status,category)=>{
            if(status===200){
                res.locals.Category=category;
                next();
            } else res.status(404).render("Categories/error",{message:"Couldn't Find this Categories"});
        })

    } )
    .get((req,res,next)=>{
        if(req.query.post) PostHandler(req,res);  //post
        else if(req.query.create){
            res.locals.WebSite.Title+=" - Create Post"
            res.render("Categories/CreatePost");
        }
        else CategoryHandler(req,res);
    })
    .post((req,res,next)=>{
        if(res.locals.currentUser!==undefined){
            upload(req,res,function (err){
                console.log(err,req.file)
                next();
            });
        }
        else res.status(305).send("You can't create a post without LogIn");
    },((req, res, next) => {
        /*PostManager.CreatePost({...req.body,author:res.locals.currentUser["_id"]},(status,message)=>{
                res.status(status).send(message)
        })*/
        res.send("done");
    }));
/*---------------Categories------------------*/
function CategoryHandler(req,res){
    let category=res.locals.Category;
    res.locals.WebSite.Title+=" - "+category.Name;
    PostManager.GetPosts({category, ...req.query},(status,posts)=>{
        if(status===200)res.status(200).render("Categories/Category1",{Posts:posts});
        else res.status(status).render("Categories/error",{message:posts});
    })
}
/*--------------Post-----------------*/
function PostHandler(req,res) {
    res.locals.WebSite.Title+=" - "+res.locals.Category.Name;
    PostManager.GetPost(req.query.post,(status,Post)=>{
        if(status===200) {
            res.locals.WebSite.Title+=" - "+Post.title;
            res.render("Posts/Post1",{Post});
        }
        else {
            res.locals.WebSite.Title+=" - "+Post;
            res.render("Categories/error",{message:Post});
        }
    })
}
module.exports = router;
