const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const { Season, Organization } = require('models');
const { filterDeletedListResponse } = require('utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  Season.all({
    where: {
      $or: [
        {
          organizationId: req.user.organizationId,
        },
        {
          organizationId: {
            $eq: null,
          },
        },
      ],
    },
  })
    .then((seasons) => {
      res.json(filterDeletedListResponse(seasons));
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errro: e.message });
    });
});

router.post('/', async (req, res, next) => {
  try {
    let season = new Season(req.body);
    season.organizationId = req.user.organizationId;
    const newSeason = await season.save();
    if (req.body.isDefault) {
      const organization = await Organization.findOne({
        where: {
          id: req.user.organizationId,
        },
      });
      organization.defaultSeason = newSeason.id;
      await organization.save();
    }
    res.json(newSeason);
  } catch (e) {
    console.log('error : ', e);
    res.status(422).json({ error: 'Error creating seasons' });
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'An Id is required' });
    const season = await Season.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!season) return res.status(404).json({ error: "This season doesn't exist" });
    const { isDefault } = req.body;
    const updatedSeason = await season.update(req.body);
    const organization = await Organization.findOne({
      where: {
        id: req.user.organizationId,
      },
    });
    if (organization.defaultSeason === season.id && isDefault === false) {
      // if equal and unchecked
      organization.defaultSeason = null;
      await organization.save();
    } else if (organization.defaultSeason !== season.id && isDefault === true) {
      organization.defaultSeason = updatedSeason.id;
      await organization.save();
    }
    res.json(updatedSeason);
  } catch (e) {
    console.log('error : ', e);
    res.status(422).json({ error: 'Error updating season' });
  }
});

router.get('/last_update', (req, res) => {
  Season.all({
    $or: [
      {
        organizationId: req.user.organizationId,
      },
      {
        organizationId: {
          $eq: null,
        },
      },
    ],
    order: Sequelize.literal('"Season"."updatedAt" DESC'),
    limit: 1,
  })
    .then((seasons) => {
      let lastUpdate = (seasons[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) res.status(400).json({ error: 'An Id is required' });
    const season = await Season.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    });
    if (season) {
      await season.update({ isDeleted: true });
      await season.softDestroy(season.id);
    }
    res.json(season);
  } catch (e) {
    console.log('error : ', e);
    res.status(422).json({ errors: 'Error deleting season' });
  }
});
