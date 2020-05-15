let router = require('express').Router(),
    FilesManager= require('../Classes/FileManager');
router.route('/*')
    .get((req,res)=>{
        let {pathname:url, query: body} = require('url').parse(req.url,true),
            callback=(JSON.parse(JSON.stringify(body)).treeView)==='true'?FilesManager.GetFilesTree:FilesManager.GetFolder;
        callback(url==="/"?"":decodeURI(url),(status,result)=>{
            res.status(status).send(result);
        });
    })
    .post((req,res)=>{
        if(req.body.NewFolder) FilesManager.NewFolder(require('url').parse(req.url).pathname,req.body.NewFolder,(status,result)=>{
            res.status(status).send(result);
        });
        else res.status(406).send("Bad Request");
    }).delete((req,res)=>{
        if(req.body.DeleteFolder) FilesManager.DeleteFolder(require('url').parse(req.url).pathname,req.body.DeleteFolder,(status,result)=>{
            res.status(status).send(result);
        });
        else res.status(406).send("Bad Request");
    })
module.exports = router;