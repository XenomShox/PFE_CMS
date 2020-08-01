var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('*', (req, res)=>{
  res.locals.message = "Not Found";
  res.locals.error = req.app.get("env") === "development" ? {status:404,stack:{}} : {};
  res.status(404).render("error",(err,html)=>{
    if(err) res.status(500).send(err);
    else res.send(html);
  });
});



module.exports = router;
