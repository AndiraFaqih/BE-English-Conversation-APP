// //require express
// const express = require("express");
// const  controller  = require("../controllers/authController");
// const router = express.Router();

// router.post("/signup", controller.signUpUser);
// router.post("/login", controller.loginUser);
// router.post("/logout", controller.logoutUser);

// module.exports = router;

const express = require("express");
const AuthController = require("../controllers/authController");
const { authCheck, isUser } = require("../middlewares/auth");

class AuthRoutes {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post("/signup", AuthController.signUpUser);
        this.router.post("/login", AuthController.loginUser);
        this.router.post("/logout",   AuthController.logoutUser);
    }

    getRouter() {
        return this.router;
    }
}

module.exports = new AuthRoutes().getRouter();
