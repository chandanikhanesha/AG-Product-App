const { ApiSeedCompany } = require('models');
const { validationResult } = require('express-validator/check');

module.exports = async (req, res, next) => {
  try {
    const body = req[req.method === 'GET' ? 'query' : 'body'];
    // const { seedCompanyId } = body;
    //
    // if (!seedCompanyId) {
    //   return res.status(400).json({ error: "seedCompanyId is required" });
    // }
    const organization = await req.user.getOrganizationInfo();
    const { technologyId: seedDealerMonsantoId, id: seedCompanyId } = await ApiSeedCompany.findOne({
      where: { organizationId: organization.id },
    });
    body.seedCompanyId = seedCompanyId;
    body.seedDealerMonsantoId = seedDealerMonsantoId;
    body.organizationName = organization.name;
    next();
  } catch (e) {
    console.log(e);
    next(e);
  }
};
