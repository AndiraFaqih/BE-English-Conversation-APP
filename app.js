const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
var logger = require("morgan");
app.use(cors());
const multer = require("multer");

//require authrouter
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).send({
    msg: "Wellcome to APP API",
  });
});

const upload = multer({
  storage: multer.memoryStorage()
})

//run server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    }
);

//use authRouter
app.use("/api", authRouter);
app.use("/api", userRouter);

module.exports = {app, upload};
