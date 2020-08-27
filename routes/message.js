const express = require("express");
const router = express.Router();

const User = require("../models/user");

// Middlewares
const { isLoggedIn, hasPermission } = require("../middlewares/middleware");

// Importing Handlers
const {
    getMessages,
    getMessage,
    addMessage,
    deleteMessage,
} = require("../handler/message");

router.get("/", isLoggedIn, getMessages);

router.get("/:id", isLoggedIn, getMessage);

router.delete("/:id", isLoggedIn, deleteMessage);

router.post(
    "/add/:sender/:receiver",
    isLoggedIn,
    async function (req, res, next) {
        try {
            let sender = await User.findById(req.params.sender);
            if (sender.id == req.user.id) return next();

            res.redirect("/");
        } catch (err) {
            next(err);
        }
    },
    addMessage
);

module.exports = router;
