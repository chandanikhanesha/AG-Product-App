'use strict';
module.exports = (sequelize, { STRING }) => {
  const MonsantoCurrency = sequelize.define(
    'MonsantoCurrency',
    {
      domain: STRING,
      code: STRING,
    },
    {},
  );

  MonsantoCurrency.associate = (models) => {};

  return MonsantoCurrency;
};
