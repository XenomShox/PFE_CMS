const Schemas = require("../Classes/ApiManager").Schemas;

exports.getSchema = async function (req, res, next) {
    Schemas.GetASchema(req.params.Api, (result, err) => {
        res.send(result);
    });
};

exports.getSchemas = async function (req, res, next) {
    if (req.body.Name !== undefined)
        res.redirect(307, req.baseUrl + "/" + req.body.Name);
    else
        Schemas.GetAllSchemas((result) => {
            res.send(result);
        });
};

exports.createSchema = function (req, res, next) {
    console.log(req.body.Schema);
    if (req.body.Schema !== undefined)
        Schemas.AddASchema(req.params.Api, req.body.Schema, (result) => {
            res.send(result);
        });
    else
        res.send({
            Error:
                "there is no Schema parameter in the body. we can't create an empty Schema",
        });
};

exports.updateSchema = function (req, res, next) {
    if (req.body.Schema !== undefined)
        Schemas.UpdateASchema(
            req.body.Name,
            req.body.NewName,
            JSON.parse(req.body.Schema),
            (result) => {
                res.send(result);
            }
        );
    else
        res.send({
            Error:
                "there is no Schema parameter in the body. we can't update with an empty Schema",
        });
};

exports.deleteSchema = function (req, res, next) {
    Schemas.DeleteASchema(req.params.Api, (result) => {
        res.send(result);
    });
};
