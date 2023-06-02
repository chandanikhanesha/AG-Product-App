module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn("Products", "SeasonId", {
        type: Sequelize.INTEGER,
        references: {
          model: "Seasons",
          key: "id"
        },
        defaultValue: 1
      });
    } catch (e) {
      console.log(e);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn("Products", "SeasonId");
    } catch (e) {
      console.log(e);
    }
  }
};
