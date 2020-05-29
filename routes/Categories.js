var express = require('express');
var router = express.Router();

/*------------------------------Categories----------------------------*/
router.route('/:Category')
    .all((req,res,next)=>{
        req.URL=decodeURI(require('url').parse(req.url).pathname);
        next();
    })
    .get((req,res)=>{
        res.render("Categories/"+req.params.Category,{},(err,html)=>{
            if(err) res.render("Categories/error",{pageName:req.params.Category,path:req.URL});
            else res.send(html);
        })
    })
    .post((req,res)=>{

    })
/*---------------------------------Edit Category-------------------------*/

/*------------------------------UnCategorised Posts----------------------------*/

module.exports = router;
