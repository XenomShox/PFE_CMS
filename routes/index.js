var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {title: `${req.MyIp}`});
});
router.get('/LogIn',function(req,res){
  res.render('LogIn');
});

module.exports = router;
