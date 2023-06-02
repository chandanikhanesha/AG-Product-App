"use strict";
module.exports = {
up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("MonsantoSummarySyncHistories", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        ProductId: {
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        BayerDealerBucketQtyBefore: {
            type: Sequelize.INTEGER,
        },
        AllGrowerQtyBefore: {
            type: Sequelize.INTEGER,
        },
        supplyBefore: {
            type: Sequelize.INTEGER,
        },
        BayerDealerBucketQty: {
            type: Sequelize.INTEGER,
        },
        AllGrowerQty: {
            type: Sequelize.INTEGER,
        },
        supply: {
            type: Sequelize.INTEGER,
        },
        syncId: {
            type: Sequelize.INTEGER,
        },
        OrganizationId: Sequelize.INTEGER,
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
    });
},
down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("MonsantoSummarySyncHistories");
},
};
