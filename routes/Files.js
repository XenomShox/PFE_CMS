let router = require('express').Router(),
    FilesManager= require('../Classes/FileManager');
router.route('/*')
    .get((req,res)=>{
        FilesManager.GetFolder(req.url,(status,result)=>{
           res.status(status).send(result);
        });
    })
    .post((req,res)=>{
        res.send("res");
    })
module.exports = router;