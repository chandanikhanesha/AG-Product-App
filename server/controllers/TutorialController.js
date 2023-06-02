const { Router } = require('express');

const authMiddleware = require('middleware/userAuth');

const { TutorialTopic } = require('../models');
const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  TutorialTopic.findAll()
    .then((tutorial) => res.json(tutorial))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching tutorial data' });
    });
});
