module.exports = (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define("RefreshToken", {
    token: {
      type: Sequelize.TEXT,
    }
  });
  return RefreshToken;
};
