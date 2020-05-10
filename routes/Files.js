let router = require('express').Router(),
    FilesManager= require('../Classes/FileManager');
router.route('/')
    .get((req,res)=>{
       console.log(req);
       res.send(req.baseUrl);
    })
    .post((req,res)=>{
        console.log(req.buffer)
        res.send("res");
    })
module.exports = router;