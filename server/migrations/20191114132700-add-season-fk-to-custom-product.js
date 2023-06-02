module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn("CustomProducts", "SeasonId", {
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
      await queryInterface.removeColumn("CustomProducts", "SeasonId");
    } catch (e) {
      console.log(e);
    }
  }
};
