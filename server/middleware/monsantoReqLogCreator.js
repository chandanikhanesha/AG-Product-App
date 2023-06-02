const { MonsantoReqLog, ...db } = require('models');

module.exports = {
  create: async ({ req, uuid, type, userName, description = '' }) => {
    try {
      const reqlog = new MonsantoReqLog({
        organizationId: req.user.organizationId,
        uuid,
        userName,
        type,
        createdAt: new Date(),
        updatedAt: new Date(),
        description,
      });
      await reqlog.save();
    } catch (err) {
      console.log(err.message);
    }
  },
};
