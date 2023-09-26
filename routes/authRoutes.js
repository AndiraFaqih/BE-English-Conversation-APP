//require express
const express = require("express");
const  controller  = require("../controllers/authController");
const router = express.Router();

router.post("/signup", controller.signUpUser);

module.exports = router;