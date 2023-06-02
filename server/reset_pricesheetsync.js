// create statement automaticlly
const CronJob = require('cron').CronJob;

const { MonsantoPriceSheet, sequelize } = require('models');

const job = new CronJob(
  //   "*/30 * * * * *",
  '*/20  * * * *',
  async () => {
    try {
      //await resetPricesheetSyncState();
    } catch (err) {}
  },
  null,
  true,
  'America/Chicago',
);

const resetPricesheetSyncState = async () => {
  console.log('Start check resetPricesheetSyncState job');
  try {
    const isSynctrueIdArray = [];
    const allMonsantoPricesheet = await MonsantoPriceSheet.findAll();
    allMonsantoPricesheet.map((item) => {
      if (item.dataValues.isSyncing) {
        const currentDate = new Date();
        const lastRequestDate = new Date(item.dataValues.endRequestTimestamp);
        if (lastRequestDate < currentDate) {
          isSynctrueIdArray.push(item.dataValues.id);
        }
      }
    });
    await Promise.all(
      isSynctrueIdArray.map(async (item) => {
        await MonsantoPriceSheet.destroy({
          where: {
            id: item,
          },
        });
      }),
    );
  } catch (err) {
    console.log(err, 'error Occured');
    throw err;
  }
  console.log('check bayer resetPricesheetSyncState job done');
};

process.env.IS_CRON_RUN === 'true' && job.start();

module.exports = { job, resetPricesheetSyncState };
