const express = require("express");
const router = express.Router();

// handlers
const { getRoles, createRole, getRole } = require("../handler/role");

router.route("/").get(getRoles).post(createRole);
router.route("/:role_id").get(getRole);

module.exports = router;
