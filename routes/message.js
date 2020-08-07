const express = require("express");
const router = express.Router();

// Importing Handlers
const {
    getMessages,
    getMessage,
    addMessage,
    deleteMessage,
} = require("../handler/message");

router.get("/", getMessages);

router.get("/:id", getMessage);

router.delete("/:id", deleteMessage);

router.route("/add/:sender/:receiver").post(addMessage);

module.exports = router;
