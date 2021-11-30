const Category = require("./Category");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  });
  User.associate = (models) => {
    User.hasMany(models.Category)
  }
  return User;
};
