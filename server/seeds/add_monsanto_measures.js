const { MonsantoMeasure } = require('models');

module.exports = async () => {
  return MonsantoMeasure.create({
    domain: 'UN-Rec-20',
    code: 'UN',
  }).then(() =>
    MonsantoMeasure.create({
      domain: 'UN-Rec-20',
      code: 'BG',
    }),
  );
};
