const express = require("express");
const app = express();
const PORT = 3001;
const mongoose = require("mongoose");
const { MONGOURI } = require("./src/keys");
//b9LoEpi0HukKfsuA

require("./models/user");
require("./models/post");

mongoose.connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("connected", () => {
  console.log("connected to mongo yeahh!!");
});
mongoose.connection.on("error", () => {
  console.log("err");
});

app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/post"));

app.listen(PORT, () => {
  console.log("server is running on port ", PORT);
});
