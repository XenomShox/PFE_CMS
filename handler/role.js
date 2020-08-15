const Role = require("../models/role");
const website = require('../Classes/WebSite')

exports.getRoles =  (req, res, next) => {
    return res.status(200).json(website.Roles);
};

exports.getRole = async (req, res, next) => {
    try {
        let role = await Role.findById(req.params.role_id);

        return res.status(200).json(role);
    } catch (err) {
        next(err);
    }
};

exports.createRole = async (req, res, next) => {
    try {
        const { category, name, ...body } = req.body;
        Object.keys(body).forEach((key) => {
            body[key] = Boolean(body[key]);
        });

        let role = await Role.create({ ...body, category, name });

        return res.status(200).json(role);
    } catch (err) {
        next(err);
    }
};
