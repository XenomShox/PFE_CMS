let router = require('express').Router(),
    fs=require("fs"),
    FilesManager= require('../Classes/FileManager'),
    multer=require("multer"),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            req.FilePath="./files"+require('url').parse(req.url).pathname;
            cb(null,req.FilePath);
        },filename: function (req, file, cb) {
            if(req.body.randomName) return cb(null, file.fieldname+Date.now() + '-' + Math.round(Math.random() * 1E9));
            req.FileName=file.originalname;
            cb(null, file.originalname);
        }
    }),
    upload=multer({ storage: storage });
router.route('/*')
    .get((req,res)=>{
        let {pathname:url, query: body} = require('url').parse(req.url,true),
            callback=(JSON.parse(JSON.stringify(body)).treeView)==='true'?FilesManager.GetFilesTree:FilesManager.GetFolder;
        callback(url==="/"?"":decodeURI(url),(status,result)=>{
            res.status(status).send(result);
        });
    })
    .post(function (req,res,next) {
        req.on('close', function (err){
            if(!req.file) fs.unlink(req.FilePath + req.FileName,function (err) {
                if(err) return console.log(err);
                console.log(req.FileName+" Aborted");
            });
        });
        next();
    },upload.single("file"),(req,res)=>{
        if(req.body.NewFolder) FilesManager.NewFolder(require('url').parse(req.url).pathname,req.body.NewFolder,(status,result)=>{
            res.status(status).send(result);
        });
        else if(req.file){res.status(200).send("Good Request");console.log(req.file)}
        else res.status(406).send("Bad Request");
    })
    .delete((req,res)=>{
        if(req.body.DeleteFolder) FilesManager.DeleteFolder(require('url').parse(req.url).pathname,req.body.DeleteFolder,(status,result)=>{
            res.status(status).send(result);
        });
        else res.status(406).send("Bad Request");
    })
module.exports = router;