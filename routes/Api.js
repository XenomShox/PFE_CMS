let router = require('express').Router(),
    Data= require('../Classes/ApiManager').Models;

router.use("/", require("./Schemas"));
/*------------------------------Data----------------------------*/
router.get('/:Api',function (req, res) {
    Data.GetData(req.params.Api,{
        find:req.body.find,
        select:req.body.select,
        limit:req.body.limit,
        skip:req.body.skip,
        sort:req.body.sort,
        count:req.body.count
    },(status,result)=>{
        res.status(status).send(result);
    });
});
router.post('/:Api',function (req, res) {
    Data.AddData(req.params.Api,req.body,(status,result)=>{
        res.status(status).send(result);
    });
});
router.delete('/:Api',function (req, res) {
    Data.DeleteData(req.params.Api,req.body["_id"],(status,result)=>{
        res.status(status).send(result);
    });
});
router.put('/:Api',function (req, res) {
    let {"_id":id,...data}=req.body;
    Data.UpdateData(req.params.Api,id,data,(status,result)=>{
        res.status(status).send(result);
    });
});
module.exports = router;
