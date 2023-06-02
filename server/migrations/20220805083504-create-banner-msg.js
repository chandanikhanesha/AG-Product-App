'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('BannerMsgs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      organizationId: {

        type: Sequelize.INTEGER
      },
       userId: {

        type: Sequelize.INTEGER
      }, 
      userName: {

        type: Sequelize.STRING
      },
      bannerMsg:{
        type:Sequelize.STRING,
      },
      showBanner:{
        type:Sequelize.BOOLEAN,
        defaultValue: true
      },
      showBannerFlagDate: {

        type: Sequelize.DATE
      },

      bannerStartDate: {

        type: Sequelize.DATE
      },
      bannerEndDate: {
 
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('BannerMsgs');
  }
};