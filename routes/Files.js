let router = require('express').Router(),
    FilesManager= require('../Classes/FileManager'),
    multer=require("multer"),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            req.FilePath="./files"+req.URL;
            cb(null,req.FilePath);
        },
        filename: function (req, file, cb) {
            if(req.body.randomName) req.FileName=file.fieldname+Date.now() + '-' + Math.round(Math.random() * 1E9);
            else req.FileName=file.originalname;
            cb(null, req.FileName);
        }
    }),
    upload=multer({storage: storage});
router.route('/*')
    .all((req,res,next)=>{
        req.URL=decodeURI(require('url').parse(req.url).pathname);
        next();
    })
    .get((req,res)=>{
        let {pathname:url, query: body} = require('url').parse(req.url,true),
            callback=req.query.treeView==='true'?FilesManager.GetFilesTree:FilesManager.GetFolder;
        callback(req.URL==="/"?"":req.URL,(status,result)=>{
            res.status(status).send(result);
        });
    })
    .post((req,res,next)=> {
        if(req.body.NewFolder) FilesManager.NewFolder(req.URL,req.body.NewFolder,(status,result)=>{
            res.status(status).send(result);
        });
        else{
            req.on('close', function (err){
                if(!req.file) FilesManager.DeleteFile(req.FilePath,req.FileName);
            });
            next();
        }
    },
        upload.single("file"),
        (req,res)=>{
        if(req.file) res.status(200).send("Good Request");
        else res.status(406).send("Bad Request");
    })
    .put((req,res)=>{
        if(req.body.Mode) {
            if(req.body.Mode==="Copy") FilesManager.CopyFiles(req.URL,req.body.Files,(status,result)=>{
                res.status(status).send(result);
            })
            else FilesManager.MoveFiles(req.URL,req.body.Files,(status,result)=>{
                res.status(status).send(result);
            })
        }
        else if(req.body.NewName &&req.body.NewName!=="index.html") FilesManager.MoveFile(req.URL+"/"+req.body.Name,req.URL+"/"+req.body.NewName)
            .then(()=>{
                res.status(200).send("Name was Changed from "+req.body.Name+" to "+req.body.NewName);
            })
            .catch((err)=>{
                res.status(404).send("Couldn't Change Name : "+err);
            });
        else res.status(406).send("Bad Request");
    })
    .delete((req,res)=>{
        if(req.body.Paths) FilesManager.DeleteFiles(req.URL,req.body.Paths,(status,result)=>{
            res.status(status).send(result);
        });
        else res.status(406).send("Bad Request");
    })
module.exports = router;