const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = mongoose.model("User");
const bcrypt = require("bcrypt"); //For Hashing The pass We use bcryptjs
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../src/keys");

router.post("/signup", (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!email || !password || !name) {
    return res.status(422).json({ error: "Please Enter All The Fields" });
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
          pic,
        });
        user
          .save()
          .then((user) => {
            res.json({ message: "Saved Successfully" });
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

  if (!email || !password) {
    return res.status(422).send({ error: "Please Enter Email & password" });
  }

  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(404).send({ error: "Invalid Email Or Password" });
    }

    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          const { _id, name, email, followers, following, pic } = savedUser;

          res.status(200).send({
            token,
            user: { _id, name, email, followers, following, pic },
          });
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
