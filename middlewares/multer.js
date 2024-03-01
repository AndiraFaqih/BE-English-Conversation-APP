// const multer = require("multer");
// const upload = multer({
//   storage: multer.memoryStorage()
// })

// module.exports = upload

const multer = require("multer");

class Multer {
    static upload() {
        return multer({
            storage: multer.memoryStorage(),
        });
    }
}

module.exports = Multer;
