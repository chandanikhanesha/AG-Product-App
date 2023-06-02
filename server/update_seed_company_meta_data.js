const models = require('./models');
const fs = require('fs');

async function go() {
  const seedCompanies = await models.SeedCompany.all();

  seedCompanies.forEach((seedCompany) => {
    const { metadata } = seedCompany;
    let data = JSON.parse(metadata);
    const cropTypes = Object.keys(data);
    cropTypes.forEach((cropType) => {
      const brandName = seedCompany[cropType + 'BrandName'];
      if (!data[cropType].brandName) {
        data = { ...data, [cropType]: { ...data[cropType], brandName } };
      }
      if (!data[cropType].hasOwnProperty('seedSource')) {
        data = {
          ...data,
          [cropType]: { ...data[cropType], seedSource: false },
        };
      }
    });
    seedCompany.update({ metadata: JSON.stringify(data) });
  });

  return;
}

go();
