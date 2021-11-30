module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define("Task", {
    name: {
      allowNull: false,
      type: Sequelize.STRING
    }
  });
  Task.associate = (models) => {
    Task.belongsTo(models.Category)
  }
  return Task;
};
