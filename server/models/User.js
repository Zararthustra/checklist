const Category = require("./Category");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    name: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    }
  });
  User.associate = (models) => {
    User.hasMany(models.Category)
  }
  return User;
};
