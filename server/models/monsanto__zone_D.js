'use strict';
module.exports = (sequelize, { STRING }) => {
  const MonsantoZone = sequelize.define(
    'MonsantoZone',
    {
      identifier: STRING,
      type: STRING,
      name: STRING,
    },
    {},
  );
  MonsantoZone.associate = () => {};
  return MonsantoZone;
};
