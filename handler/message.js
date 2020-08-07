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

        // const query = userSender.select({ chat: { partner: userReceiver.id } });

        // if (
        //     userSender.chat.findIndex((c) =>
        //         c.partner.equals(userReceiver.id)
        //     ) === -1
        // )
        //     userSender.chat.push({ partner: userReceiver.id, messages: [] });
        // if (
        //     userReceiver.chat.findIndex((c) =>
        //         c.partner.equals(userSender.id)
        //     ) === -1
        // )
        //     userReceiver.chat.push({ partner: userSender.id, messages: [] });

        // const chat1 = userSender.chat.findIndex((c) =>
        //     c.partner.equals(userReceiver.id)
        // );
        // const chat2 = userReceiver.chat.findIndex((c) =>
        //     c.partner.equals(userSender.id)
        // );

        // userSender.chat[chat1].messages.push(message.id);
        // userReceiver.chat[chat2].messages.push(message.id);

        if (
            !userSender.contacts.some((contact) =>
                contact.equals(userReceiver.id)
            )
        )
            userSender.contacts.push(userReceiver.id);
        if (
            !userReceiver.contacts.some((contact) =>
                contact.equals(userSender.id)
            )
        )
            userReceiver.contacts.push(userSender.id);

        await userSender.save();
        await userReceiver.save();

        const foundMessage = await Message.findById(message.id)
            .populate("sender", {
                username: true,
            })
            .populate("receiver", {
                username: true,
            });
        // return res.status(200).json(userSender);
        res.redirect(req.header("Referer") || "/");
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
