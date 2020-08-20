let router = require('express').Router(),
    FilesManager= require('../Classes/FileManager'),
    formidable=require("formidable"),
    { isLoggedIn ,hasPermission} = require("../middlewares/middleware");

router.all("*",isLoggedIn,(req,res,next)=>{
    req.URL=decodeURI(require('url').parse(req.url).pathname);
    next();
});
router.route("/:UserId")
    .get((req, res, next) => {
        if(req.params.UserId===req.user._id.toString())
            FilesManager.GetFolder("/"+req.params.UserId,(status,result)=>{
                res.status(status).send(result);
            });
        else next();
    })
    .post( (req,res,next)=>{
        if(req.params.UserId===req.user._id.toString()) {
            const form = formidable({ multiples: true });
            form.parse(req, (err, fields, files) => {
                if (err || !files["file"]) return res.status(401).send("Bad Request");
                FilesManager.UploadFiles((files["file"] instanceof Array),"/"+req.params.UserId+"/",files["file"],
                    (status,result)=>{
                        res.status(status).send(result);
                    });
            });
        }
        else next();
    });
router.route('/*')
    .all(hasPermission("admin_privillage"))
    .get((req,res)=>{
        let callback=req.query.treeView==='true'?FilesManager.GetFilesTree:FilesManager.GetFolder;
        callback(req.URL==="/"?"":req.URL,(status,result)=>{
            res.status(status).send(result);
        });
    })
    .post((req,res,next)=> {
        if(req.body.NewFolder) FilesManager.NewFolder(req.URL,req.body.NewFolder,(status,result)=>{ res.status(status).send(result); });
        else{
            formidable({ multiples: true }).parse(req, (err, fields, files) => {
                if (err || !files["file"]) return res.status(401).send("Bad Request");
                FilesManager.UploadFiles((files["file"] instanceof Array),req.URL+"/",files["file"],
                    (status,result)=>{
                        res.status(status).send(result);
                    });
            });
        }
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