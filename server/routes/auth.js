const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = mongoose.model("User");
const bcrypt = require("bcrypt"); //For Hashing The pass We use bcryptjs
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../src/keys");

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    res.status(400).send({ error: "All The Fields Are Required" });
  }

  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(400)
          .send({ error: "user already exists with that email" });
      }

      bcrypt.hash(password, 15).then((hashedpass) => {
        const user = new User({
          email,
          password: hashedpass,
          name,
        });
        user
          .save()
          .then((user) => {
            res.send(user + "token" + user.token);
          })
          .catch((err) => {
            console.log(err);
          });
      }); //the bigger the number more secure the pass
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  if (!password) {
    return res.status(422).send({ error: "Please Enter Password" });
  }

  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res
        .status(404)
        .send({ error: "Please Enter Valid Email And Password" });
    }

    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          //res.send({message:"successfully signed in"});

          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);

          res.status(200).send({ token });
        } else {
          res.status(422).send({ error: "Password Incorrect" });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

module.exports = router;
