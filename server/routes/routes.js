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
  return jwt.sign(user, clientSecret);
};

const isAdmin = (req, res, next) => {
  const adminSecret = req.headers['admin-secret'];
  if (adminSecret === process.env.ADMIN_SECRET) return next()
  return res.sendStatus(403);
}

const authenticateAccessToken = (req, res, next) => {
  const accessToken = req.body.token;

  if (!accessToken) res.sendStatus(401);

  jwt.verify(accessToken, clientSecret, (err, data) => {
    if (err) res.sendStatus(401);
    data.userValidated.token = accessToken;
    req.data = data.userValidated;
    next();
  });
};

//______________________________User___________________________

// Check existing account
router.post("/user/login", (req, res) => {
  const name = req.body.name;
  const password = req.body.password;

  db.User.findOne({
    where: {
      name: name,
      password: password,
    },
  }).then((userValidated) => {
    if (!userValidated) res.send("Wrong credentials");
    else {
      const accessToken = createAccessToken({ userValidated });
      res.send({
        id: userValidated.id,
        name: userValidated.name,
        password: userValidated.password,
        accessToken: accessToken,
      });
    }
  });
});

// Retrieve all
router.get("/user", isAdmin, (req, res) => {
  db.User.findAll({
    order: [["createdAt", "DESC"]],
  }).then((users) => res.json(users));
});

// Retrieve one
router.get("/user/:id", isAdmin, (req, res) => {
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
    if (creationStatus[1]) {
      const createdUser = creationStatus[0];
      const accessToken = createAccessToken({ createdUser });
      res.send({
        id: createdUser.id,
        name: createdUser.name,
        password: createdUser.password,
        accessToken: accessToken,
      });
    } else res.send(creationStatus[1]);
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
router.post("/category", authenticateAccessToken, (req, res) => {
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
