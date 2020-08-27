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
        let role = await Role.findById(req.params.role_id);
        if (role.name === "Owner" && role.owner) return res.status(403).json({error: {message: "you cannot modify this role"}})
        role = await Role.findByIdAndUpdate(req.params.role_id, {
            ...req.body,
        });
        return res.status(200).json(role);
    } catch (err) {
        next(err);
    }
};

exports.removeRole = async (req, res, next) => {
    try {
        let role = await Role.findById(req.params.role_id);
        if (role.name === "Owner" && role.owner) return res.status(403).json({error: {message: "you cannot delete this role"}})
        await role.remove();
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

        let role;
        if (await Role.count({} > 0)) role = await Role.create({ ...body, owner: false, category, name });
        else role = await Role.create({ ...body, category, name });
        return res.status(200).json(role);
    } catch (err) {
        next(err);
    }
};
