import express from "express";
const router = express.Router();

import dotenv from "dotenv";
dotenv.config();

import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

router.post("/signup", (req, res) => {
  try {
    if (req.body.email.length === 0 || req.body.password.length === 0) {
      return res.status(400).json({ message: 'Email or password empty' })
    };
    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(req.body.email)) {
      console.log('Email format incorrect')
      return res.status(400).json({ message: 'Email format incorrect' })
    }

    bcrypt.hash(req.body.password, 10)
      .then((hashedPassword) => {
        const newUser = new User({
          email: req.body.email.trim().toLowerCase(),
          password: hashedPassword
        })
        newUser.save()
          .then(() => {
            console.log("User created successfully");
            res.status(201).json({ message: 'User created successfully' })
          })
          .catch((err) => {
            if(err.name === "ValidationError"){
              console.log("Email already in use");
              return res.status(400).json({ message: "Email already in use"})
            }
            console.log("Error trying to save the user");
            res.status(500).json({ message: "Error trying to save the user"})
          });
      })

      .catch(() => {
        console.log("Error trying to hash the password");
        res.status(500).json({ message: "Error trying to hash the password" })
      });
  } catch (error) {
    console.log("Error trying to lauch the process of signing UP");
    res.status(500).json({ message: "Error trying to lauch the process of signing UP" })
  }

})

router.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(401).json({ message: "Email AND password required" });
  };

  try {
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          console.log("Id and or password incorrect");
          res.status(401).json({ message: "Id and or password incorrect"});
        } else {
          bcrypt.compare(req.body.password, user.password)
            .then((passwordIsValid) => {
              if (!passwordIsValid) {
                console.log("Id and or password incorrect");
                res.status(401).json({ message: "Id and or password incorrect" });
              } else {
                console.log("User found");
                res.status(200).json({
                  userId: user._id,
                  token: jsonwebtoken.sign({
                    userId: user._id
                  },
                    process.env.RANDOM_SECRET_TOKEN,
                    { expiresIn: '24h' }
                  ),
                  message: "User found"
                });
              };
            })
            .catch(() => {
              console.log('Error trying to find user');
              res.status(401).json({ message: "Error trying to find user" })
            });
        }
      })
      .catch(() => {
        console.log('Error trying to find user, authRouter.js');
        res.status(401).json({ message: "Error trying to find user" })
      })

  } catch (error) {
    console.log("Error trying to lauch the process of log in, authRouter.js");
    res.status(500).json({ message: "Error trying to lauch the process of log in" })
  };
});

export default router;