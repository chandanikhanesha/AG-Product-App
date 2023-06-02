"use strict";
module.exports = {
  up: (queryInterface) => {
    return queryInterface.addConstraint(
      "MonsantoRetailerOrderSummaryProducts",
      ["SummaryId", "ProductId"],
      {
        type: "unique",
        name: "summary_composite_unique"
      }
    );
  },
  down: (queryInterface) => {
    return queryInterface.removeConstraint(
      "MonsantoRetailerOrderSummaryProducts",
      "summary_composite_unique"
    );
  }
};
