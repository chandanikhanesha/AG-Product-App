"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addConstraint("MonsantoProducts", ["crossReferenceId",'OrganizationId'], {
        type: "unique",
        name: "crossReferenceId_unique_constraint"
      })
      .catch(err => console.log(err));
  },
  down: queryInterface => {
    return queryInterface
      .removeConstraint(
        "MonsantoProducts",
        "crossReferenceId_unique_constraint"
      )
      .catch(err => console.log(err));
  }
};
