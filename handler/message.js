const Message = require("../models/messages");
const User = require("../models/user");

exports.getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find();

        return res.status(200).json(messages);
    } catch (err) {
        return next(err);
    }
};

exports.getMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);

        return res.status(200).json(message);
    } catch (err) {
        return next(err);
    }
};

exports.addMessage = async (req, res, next) => {
    try {
        const { user1, user2 } = req.params;
        const { text } = req.body;
        let message = await Message.create({ text, user1, user2 });

        let userSender = await User.findById(user1);
        let userReceiver = await User.findById(user2);

        userSender.messages.push(message.id);
        userReceiver.messages.push(message.id);

        await userSender.save();
        await userReceiver.save();

        const foundMessage = await Message.findById(message.id)
            .populate("user1", {
                username: true,
            })
            .populate("user2", {
                username: true,
            });

        return res.status(200).json(foundMessage);
    } catch (err) {
        return next(err);
    }
};

exports.deleteMessage = async (req, res, next) => {
    try {
        const foundMessage = await Message.findById(req.params.id);

        await foundMessage.remove();
        return res.status(200).json(foundMessage);
    } catch (err) {
        return next(err);
    }
};
