const { ActionLog, ...db } = require('models');

module.exports = {
  create: async ({ req, operation, type, previousData, changedData, typeId }) => {
    try {
      //console.log(req.user)
      let actionLog = new ActionLog({
        organizationId: req.user.organizationId,
        user: req.user.firstName + ' ' + req.user.lastName,
        userId: req.user.id,
        type,
        typeId,
        operation,
        operationTime: new Date(),
        previousData,
        changedData,
      });
      await actionLog.save();
    } catch (err) {
      console.log(err.message);
    }
  },
};
