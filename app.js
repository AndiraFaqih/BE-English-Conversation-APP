const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
var logger = require("morgan");
app.use(cors());

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const chatRouter = require("./routes/chatRoutes");

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
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
    }
);

app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", chatRouter);

module.exports =  app ;
