const express = require("express");
const router = express.Router();

// handlers
const {
    getRoles,
    createRole,
    getRole,
    modifyRole,
    removeRole,
} = require("../handler/role");

router.route("/").get(getRoles).post(createRole);
router.route("/:role_id").get(getRole).put(modifyRole).delete(removeRole);

module.exports = router;
