var express = require('express');
var router = express.Router();
const { isLoggedIn ,isAdmin} = require("../middlewares/middleware");

router.all('*',isLoggedIn,isAdmin);
router.route("/")
    .all((req,res,next)=>{
        req.URL=decodeURI(require('url').parse(req.url).pathname);
        next();
    })
    .get((req, res )=> {
        res.render("Admin/index",{url:"/Admin/dashboard"});
    });
router.route('/:Admin')
    .get(function(req,res,next){
        if(req.query.f!==undefined)
            res.render("Admin/"+req.params.Admin,(err,html)=>{
                if(err) res.render("Admin/error",{pageName:req.params.Admin,path:req.URL});
                else res.send(html);
            });
        else
            res.render("Admin/index",{url:req.URL});
    });

module.exports = router;