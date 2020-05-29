var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('MainPage/index', {title: req.MyIp});
});
router.get('/LogIn',function(req,res){
  res.render('LogIn');
});
router.get('/:category',(req,res)=>{
  res.render("Categories/Category1",{title:"WebSite",Category:req.params.category});
});


module.exports = router;
