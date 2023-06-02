'use strict';
module.exports = (sequelize, { STRING }) => {
  const MonsantoMeasure = sequelize.define(
    'MonsantoMeasure',
    {
      domain: STRING,
      code: STRING,
    },
    {},
  );

  MonsantoMeasure.associate = (models) => {};

  return MonsantoMeasure;
};
