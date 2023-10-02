const express = require("express");
const  controller  = require("../controllers/userController");
const router = express.Router();

router.post("/profile/edit", controller.updateUserProfile);
router.get("/profile", controller.getUserProfile);
router.delete("/delete", controller.deleteUserAccount);

module.exports = router;