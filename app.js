const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
var logger = require("morgan");
app.use(cors());

//require authrouter
const authRouter = require("./routes/authRoutes");

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).send({
    msg: "Wellcome to APP API",
  });
});

//run server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    }
);

//use authRouter
app.use("/api", authRouter);

module.exports = app;
