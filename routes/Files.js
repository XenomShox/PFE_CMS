let router = require('express').Router(),
    FilesManager= require('../Classes/FileManager');
router.route('/*')
    .get((req,res)=>{
        let {pathname:url, query: body} = require('url').parse(req.url,true),
            callback=(JSON.parse(JSON.stringify(body)).treeView)==='true'?FilesManager.GetFilesTree:FilesManager.GetFolder;
        callback(url==="/"?"":url,(status,result)=>{
            res.status(status).send(result);
        });
    })
    .post((req,res)=>{
        res.send("res");
    })
module.exports = router;