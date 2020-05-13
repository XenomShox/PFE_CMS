let router = require('express').Router(),
    FilesManager= require('../Classes/FileManager');
router.route('/*')
    .get((req,res)=>{
        let callback=req.body.treeView?FilesManager.GetFilesTree:FilesManager.GetFolder;
        callback(req.url==="/"?"":req.url,(status,result)=>{
            res.status(status).send(result);
        });
    })
    .post((req,res)=>{
        res.send("res");
    })
module.exports = router;