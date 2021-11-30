module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define("Task", {
    name: {
      type: Sequelize.STRING
    }
  });
  Task.associate = (models) => {
    Task.belongsTo(models.Category)
  }
  return Task;
};
