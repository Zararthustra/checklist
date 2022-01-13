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
const ATSecret = process.env.ACCESS_TOKEN_SECRET;
const RTSecret = process.env.REFRESH_TOKEN_SECRET;

const createAccessToken = (user) => {
  return jwt.sign(user, ATSecret, { expiresIn: "1h" });
};

const authenticateAccessToken = (req, res, next) => {
  const accessToken = req.headers["authorization"];

  if (!accessToken) res.sendStatus(401);

  jwt.verify(accessToken, ATSecret, (err, data) => {
    if (err) return res.sendStatus(403);
    data.userValidated.token = accessToken;
    req.data = data.userValidated;
    next();
  });
};

router.post("/refreshAT", (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken == null) return res.sendStatus(401);
  if (retrieveRTfromDB(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, RTSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    const userValidated = user.userValidated;
    const accessToken = createAccessToken({ userValidated });
    res.json({ accessToken: accessToken });
  });
});

const createRTinDB = (refreshToken) => {
  db.RefreshToken.create({
    token: refreshToken,
  }).then((addedRT) =>
    addedRT
      ? console.log("RT created.")
      : console.log("RT not created, an error occured.")
  );
};

const deleteRTfromDB = (refreshToken) => {
  db.RefreshToken.destroy({
    where: { token: refreshToken },
  }).then((res) => console.log("RT deleted ? (1 = yes, 0 = no): ", res));
};

const retrieveRTfromDB = (refreshToken) => {
  db.RefreshToken.findOne({
    where: { token: refreshToken },
  }).then((RT) => (RT ? true : console.log("Could not find this RT in DB.")));
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
    if (!userValidated) return res.send("Wrong credentials");

    const accessToken = createAccessToken({ userValidated });
    const refreshToken = jwt.sign({ userValidated }, RTSecret, { expiresIn: "30d" });
    createRTinDB(refreshToken);

    res.send({
      id: userValidated.id,
      name: userValidated.name,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  });
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
      const userValidated = creationStatus[0];
      const accessToken = createAccessToken({ userValidated });
      const refreshToken = jwt.sign({ userValidated }, RTSecret, { expiresIn: "30d" });
      createRTinDB(refreshToken);

      res.send({
        id: userValidated.id,
        name: userValidated.name,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
      // Send False if exists
    } else res.send(creationStatus[1]);
  });
});

router.post("/user/logout", (req, res) => {
  deleteRTfromDB(req.body.refreshToken)
})

// Private user queries
const isAdmin = (req, res, next) => {
  const adminSecret = req.headers["admin-secret"];
  if (adminSecret === process.env.ADMIN_SECRET) return next();
  return res.sendStatus(403);
};

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
  }).then((user) => res.json(user));
});

//______________________________Category___________________________

// Retrieve all by user
router.get("/:user/categories", authenticateAccessToken, (req, res) => {
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
router.delete(
  "/categories/:categoryId",
  authenticateAccessToken,
  (req, res) => {
    const categoryId = req.params.categoryId;

    db.Category.destroy({
      where: { id: categoryId },
    }).then(() => res.send("Category deleted"));
  }
);

//______________________________Task___________________________

// Retrieve all
router.get("/:categoryId/tasks", authenticateAccessToken, (req, res) => {
  db.Task.findAll({
    where: {
      CategoryId: req.params.categoryId,
    },
  }).then((tasks) => res.json(tasks));
});

// Create
router.post("/task", authenticateAccessToken, (req, res) => {
  db.Task.create({
    name: req.body.name,
    CategoryId: req.body.categoryId,
  }).then((addedTask) => res.json(addedTask));
});

// Delete
router.delete("/tasks/:taskId", authenticateAccessToken, (req, res) => {
  db.Task.destroy({
    where: { id: req.params.taskId },
  }).then(() => res.send("Task deleted"));
});

module.exports = router;
