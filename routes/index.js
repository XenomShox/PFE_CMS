var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('MainPage/index', {WebSite: req.app.get("System")});
});



module.exports = router;
