const express = require("express");
const  controller  = require("../controllers/userController");
const router = express.Router();

router.post("/edit", controller.updateUserProfile);
router.delete("/delete", controller.deleteUserAccount);

module.exports = router;