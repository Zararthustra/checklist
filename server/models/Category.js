module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define("Category", {
    name: {
      allowNull: false,
      type: Sequelize.STRING
    }
  });
  Category.associate = (models) => {
    Category.belongsTo(models.User),
    Category.hasMany(models.Task)
  }
  return Category;
};
