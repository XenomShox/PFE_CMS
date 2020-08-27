const router = require('express').Router(),
    CategoriesManager=require("../Classes/CategoriesManager"),
    PostManager=require("../Classes/PostManager"),
    CommentManager=require("../Classes/CommentsManager"),
    app=require("../app"),
    Schema=app.get("Schema");
router.get('/', function(req, res) {
    PostManager.GetPosts({sort:"-visited"},(status,Posts)=>{
        if(status===200) res.render(Schema.path+Schema.Index.path, {Posts});
        else res.render(Schema.path+Schema.Error.path,{message:Posts})
    })
});
router.route('/Categories')
    .get((req, res) => {
        res.redirect("/");
    })
    .post((req, res) => {
        //verify if he is an admin
        CategoriesManager.CreateCategory({
            Slug:req.body.Slug,
            Name:req.body.Name,
            Description:req.body.Description,
            Posts:[]
        },(status,message)=>{res.status(status).send(message);});
    })
router.route('/Categories/*')
    .all((req,res,next)=> {
        let {pathname,query}=require('url').parse(req.url,true);
        req.URL=decodeURI(pathname);
        req.query=query;
        CategoriesManager.GetCategory(req.URL,(status,category)=>{
            if(status===200){
                res.locals.Category=category;
                next();
            } else res.status(404).render(Schema.path+Schema.Error.path,{message:"Couldn't Find this Categories"});
        })
    } )
    .get((req,res)=>{
        if(req.query.post) PostHandler(req,res);  //post
        else if(req.query.create){
            res.locals.WebSite.Title+=" - Create Post"
            res.render(Schema.path+Schema.CreatePost.path);
        }
        else CategoryHandler(req,res);
    })
    .post((req,res)=>{
        if(res.locals.currentUser){
            req.body.tags=req.body.tags.split(" ")
            if( !(req.body.covers instanceof Array) ) req.body.covers=[req.body.covers];
            if(req.query.post) {
                CommentManager.Create(req.query.post,req.query.commentId,req.query.comment,(status,result)=>{
                    res.status(status).send(result);
                })
            }
            else PostManager.CreatePost({...req.body,category:res.locals.Category["_id"],author:res.locals.currentUser["_id"]},(status,post)=>{
                if(status===201) res.redirect(res.locals.Category.Slug+"?post="+post._id);
                else res.status(status).render(Schema.path+Schema.Error.path,{message:"Couldn't Create Post"});
            })
        }
        else res.status(305).send("You can't create a post without LogIn");
    });
/*----------------Tag System-----------------*/
router.route("/tags/:tag")
    .get((req, res) => {
        let {query}=require('url').parse(req.url,true);
        PostManager.GetPosts({tag:req.params.tag,...query},(status,Posts)=>{
            if(status===200)res.status(200).render(Schema.path+Schema.Tags.path,{Posts,tag:req.params.tag});
            else res.status(status).render(Schema.path+Schema.Error.path,{message:Posts});
        });

    })
/*----------------Search System-----------------*/
router.route("/search/")
    .all((req, res, next) => {
        let {pathname,query}=require('url').parse(req.url,true);
        req.URL=decodeURI(pathname);
        req.query=query;
        next();
    })
    .get((req, res,next) => {
        PostManager.GetPosts({
            title:req.query.search,
            sort:req.query.sort,
            skip:(req.query.page-1)*10,//*page time limit
            limit:10,
            tag:req.query.tag,
            category:req.query.category
        },(status,Posts)=>{
            if(status===200) res.status(200).render(Schema.path+Schema.Search.path,
                {Posts,search:req.query.search || req.query.category || req.query.tag});
            else next();
        })
    })

/*---------------Categories------------------*/
function CategoryHandler(req,res){
    let category=res.locals.Category;
    res.locals.WebSite.Title+=" - "+category.Name;
    PostManager.GetPosts({category, ...req.query},(status,Posts)=>{
        if(status===200)res.status(200).render(Schema.path+Schema.Categories.path,{Posts});
        else res.status(status).render(Schema.path+Schema.Error.path,{message:Posts});
    })
}
/*--------------Post-----------------*/
function PostHandler(req,res) {
    res.locals.WebSite.Title+=" - "+res.locals.Category.Name;
    PostManager.GetPost(req.query.post,(status,Post)=>{
        if(status===200) {
            res.locals.WebSite.Title+=" - "+Post.title;
            if(req.query.edit) res.render(Schema.path+Schema.EditPost.path,{Post});
            else res.render(Schema.path+Schema.Post.path,{Post});
        }
        else {
            res.locals.WebSite.Title+=" - "+Post;
            res.render(Schema.path+Schema.Error.path,{message:Post});
        }
    });
}
/*-------------------Error-------------*/
router.route("*").all((req, res) => {
    res.status(404).render(Schema.path+Schema.Error.path, {message: "Page Not Found"});
})
module.exports = router;
