const express = require("express");
const router = express.Router();
const db = require("../models");
const { Op } = require("sequelize");
const cors = require("cors");

//______________________________SetUp__________________________

router.use(express.json());
router.use(cors());

//______________________________JWT Strategy___________________

require("dotenv").config();
const jwt = require("jsonwebtoken");
const clientSecret = process.env.CLIENT_SECRET;

const createAccessToken = (user) => {
  return jwt.sign(user, clientSecret, { expiresIn: "1d" });
};

const authenticateAccessToken = (req, res, next) => {
  const accessToken = req.body.token;

  if (!accessToken) res.sendStatus(401);

  jwt.verify(accessToken, clientSecret, (err, data) => {
    if (err) res.sendStatus(401);
    data.userValidated.token = accessToken
    req.data = data.userValidated; //miss accesstoken 
    next();
  });
};

//______________________________User___________________________

// Check by token
router.post("/user/loginbytoken", authenticateAccessToken, (req, res) => {
  res.send(req.data);
});

// Check without token
router.post("/user/login", (req, res) => {
  const name = req.body.name;
  const password = req.body.password;

  db.User.findOne({
    where: {
      name: name,
      password: password,
    },
  }).then((userValidated) => {
    if (!userValidated) res.status(401).send("Wrong credentials");
    const accessToken = createAccessToken({ userValidated });

    res.send({
      id: userValidated.id,
      name: userValidated.name,
      password: userValidated.password,
      accessToken: accessToken,
    });
  });
});

// Retrieve all
router.get("/user", (req, res) => {
  db.User.findAll({
    order: [["createdAt", "DESC"]],
  }).then((users) => res.json(users));
});

// Retrieve one
router.get("/user/:id", (req, res) => {
  db.User.findOne({
    where: {
      id: req.params.id,
    },
    order: [["createdAt", "DESC"]],
  }).then((users) => res.json(users));
});

// Create if not exist
router.post("/user", (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  db.User.findOrCreate({
    where: {
      name: name,
      password: password,
    },
  }).then((creationStatus) => {
    if (creationStatus[1]) res.json(creationStatus[0]);
    else res.send(creationStatus[1]);
  });
});

//______________________________Category___________________________

// Retrieve all by user
router.get("/:user/category", (req, res) => {
  db.Category.findAll({
    where: {
      UserId: req.params.user,
    },
  }).then((categories) => {
    res.json(categories);
  });
});

// Create
router.post("/category", (req, res) => {
  const name = req.body.name;
  const userId = req.body.userId;

  db.Category.create({
    name: name,
    UserId: userId,
  }).then((addedCategory) => res.json(addedCategory));
});

// Delete
router.delete("/category/:id", (req, res) => {
  const id = req.params.id;

  db.Category.destroy({
    where: { id: id },
  }).then(() => res.send("Category deleted"));
});

//______________________________Task___________________________

// Retrieve all
router.get("/:category/task", (req, res) => {
  db.Task.findAll({
    where: {
      CategoryId: req.params.category,
    },
    order: [["createdAt", "DESC"]],
  }).then((tasks) => res.json(tasks));
});

// Create
router.post("/task", (req, res) => {
  const name = req.body.name;
  const categoryId = req.body.categoryId;

  db.Task.create({
    name: name,
    CategoryId: categoryId,
  }).then((addedTask) => res.json(addedTask));
});

// Delete
router.delete("/task/:id", (req, res) => {
  const id = req.params.id;

  db.Task.destroy({
    where: { id: id },
  }).then(() => res.send("Task deleted"));
});

module.exports = router;
