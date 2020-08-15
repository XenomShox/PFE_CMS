const Role = require("../models/role");

exports.getRoles = async (req, res, next) => {
    let roles = await Role.find();
    return res.status(200).json(roles);
};

exports.getRole = async (req, res, next) => {
    try {
        let role = await Role.findById(req.params.role_id);

        return res.status(200).json(role);
    } catch (err) {
        next(err);
    }
};

exports.modifyRole = async (req, res, next) => {
    try {
        const { category, name, ...body } = req.body;
        Object.keys(body).forEach((key) => {
            body[key] = Boolean(body[key]);
        });
        let role = await Role.findByIdAndUpdate(req.params.role_id, {
            category,
            name,
            ...body,
        });
        console.log(req.body);
        return res.status(200).json(role);
    } catch (err) {
        next(err);
    }
};

exports.removeRole = async (req, res, next) => {
    try {
        const { category, name, ...body } = req.body;
        Object.keys(body).forEach((key) => {
            body[key] = Boolean(body[key]);
        });
        let role = await Role.findByIdAndDelete(req.params.role_id);
        console.log(body);
        console.log(category);
        console.log(name);
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
