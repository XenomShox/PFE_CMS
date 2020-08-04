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
        const { sender, receiver } = req.params;
        const { text } = req.body;
        let message = await Message.create({ text, sender, receiver });

        let userSender = await User.findById(sender);
        let userReceiver = await User.findById(receiver);

        userSender.messages.push(message.id);
        userReceiver.messages.push(message.id);

        await userSender.save();
        await userReceiver.save();

        const foundMessage = await Message.findById(message.id)
            .populate("sender", {
                username: true,
            })
            .populate("receiver", {
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
