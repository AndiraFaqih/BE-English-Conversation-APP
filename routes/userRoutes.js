// const express = require("express");
// const { authCheck, isUser } = require("../middlewares/auth");
// const  controller  = require("../controllers/userController");
// const router = express.Router();
// const upload = require("../middlewares/multer");

// router.post("/profile/edit",authCheck, isUser,upload.single("photoProfile"), controller.updateUserProfile);
// router.put("/profile/editpassword",authCheck, isUser, controller.changePassword);
// router.get("/profile",authCheck, isUser, controller.getUserProfile);
// router.delete("/delete",authCheck, isUser, controller.deleteUserAccount);

// module.exports = router;

const express = require("express");
const UserController = require("../controllers/userController");
const { authCheck, isUser } = require("../middlewares/auth");
// const upload = require("../middlewares/multer");
const Multer = require("../middlewares/multer");

class UserRoutes {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post("/profile/edit", authCheck, isUser, Multer.upload().single("photoProfile"), UserController.updateUserProfile);
        this.router.put("/profile/editpassword", authCheck, isUser, UserController.changePassword);
        this.router.get("/profile", authCheck, isUser, UserController.getUserProfile);
        this.router.delete("/delete", authCheck, isUser, UserController.deleteUserAccount);
    }

    getRouter() {
        return this.router;
    }
}

module.exports = new UserRoutes().getRouter();