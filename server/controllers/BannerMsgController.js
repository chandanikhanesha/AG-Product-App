const { Router } = require('express');
const { check, validationResult } = require('express-validator/check');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const { BannerMsg, BannerTextMsg } = require('models');
const router = (module.exports = Router().use(authMiddleware));

router.get('/', async (req, res) => {
  const bannerTextData = await BannerTextMsg.findAll({
    where: {
      isShowMsg: true,
    },
    raw: true,
  });

  await BannerMsg.findOne({
    where: { organizationId: req.user.organizationId, userId: req.user.id },
    raw: true,
  })
    .then((banner) => {
      const data = [];
      const max = bannerTextData.reduce((acc, date) => {
        return acc && new Date(acc.updatedAt) >= new Date(date.updatedAt) ? acc : date;
      }, '');

      console.log(banner.updatedAt, 'max <=', max);

      new Date(banner.updatedAt) <= new Date(max.updatedAt) ? data.push(max) : [];

      res.json(data);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error listing banner' });
    });
});
router.get('/allBannerText', async (req, res) => {
  BannerTextMsg.findAll({ order: [['createdAt', 'DESC']] })
    .then((banner) => {
      res.json(banner);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error listing banner' });
    });
});

router.patch('/', (req, res) => {
  BannerMsg.update(
    { updatedAt: req.body.updatedAt },
    {
      where: {
        organizationId: req.user.organizationId,
        userId: req.user.id,
      },
    },
  )
    .then((banner) => res.json(banner))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating banner' });
    });
});
