let router = require('express').Router(),
    Data=require('../Classes/Models');




router.use("/", require("./Schemas"));
/* GET Api page. */
router.get('/',function (req, res) {
    res.send(Data.models);
});

/*------------------------------Data----------------------------*/
router.get('/:Api',function (req, res) {
    Data.GetData(req.params.Api,{
        find:req.body.find,
        select:req.body.select,
        limit:req.body.limit,
        skip:req.body.skip,
        Sort:req.body.Sort,
        Count:req.body.Count
    },(result)=>{
        res.send(result);
    });
});


router.post('/:Api',function (req, res) {
    Data.AddData(req.params.Api,req.body,(result)=>{
        res.send(result);
    });
});
router.delete('/:Api',function (req, res) {
    console.log(req.body);
    res.send(req.body);
    //delete ":Api"and then redirect to /Schema
});
router.put('/:Api',function (req, res) {
    console.log(req.body);
    res.send("dead "+req.params.Api);
    //verify if the Schema for mongoose
    //Update ":Api"and then redirect to /Schema
});
module.exports = router;
