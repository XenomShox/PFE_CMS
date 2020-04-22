let router = require('express').Router(),
    Schemas=require('../Classes/Schemas');

router.get('/',function (req, res) {
    if (req.body.Name !== undefined)
        Schemas.GetASchema(req.body.Name, (status, result) => {
            res.status(status).send(result);
        });
    else
        Schemas.GetAllSchemas((status, result) => {
            res.status(status).send(result);
        });
});
router.post('/',(req,res)=> {
    if (req.body.Name !== undefined) {
        if(!(/^[1-9A-Za-z_]+$/.test(req.body.Name))) res.status(401).send({Error:'Invalid Schema Name it must follow this regEX : "^[1-9A-Za-z]+$"'});
        else if (req.body.Schema !== undefined) Schemas.AddASchema(req.body.Name, req.body.Schema, (status, result) => {
                res.status(status).send(result);
            });
        else res.status(406).send({Error: "there is no Schema parameter in the body. we can't create an empty Schema"});
    } else
        res.status(406).send({Error: "Can't Create a Schema without a Name"});
});
router.put('/',(req,res)=> {
    if (req.body.Name !== undefined) {
        if(!(/^[1-9A-Za-z_]+$/.test(req.body.NewName))) res.status(401).send({Error:'Invalid Schema Name it must follow this regEX : "^[1-9A-Za-z]+$"'});
        else if (req.body.Schema !== undefined) Schemas.UpdateASchema(req.body.Name, req.body.NewName, req.body.Schema, (status, result) => {
                res.status(status).send(result);
            });
        else res.status(406).send({Error: "there is no Schema parameter in the body. we can't update with an empty Schema"});
    } else res.status(406).send({Error: "Can't Update a Schema without a Name"});
});
router.delete('/',(req,res)=>{
    if (req.body.Name !== undefined)
        Schemas.DeleteASchema(req.body.Name, (status, result) => {
            res.status(status).send(result);
        });
    else
        res.status(406).send({Error: "Can't Delete a Schema without a Name"});
});
module.exports = router;
