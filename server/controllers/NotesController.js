const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('../middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { Note } = require('../models');
const { filterDeletedListResponse } = require('../utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
      isDeleted: false,
    },
  };
  Note.findAll(query)
    .then((notes) => {
      res.json(filterDeletedListResponse(notes));
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching notes' });
    });
});

router.get('/detail/:id', (req, res, next) => {
  const query = {
    where: {
      id: req.body.id,
      organizationId: req.user.organizationId,
    },
  };

  Note.findById(req.params.id)
    .then((note) => {
      res.json(note);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching note by id' });
    });
});

router.post('/', (req, res, next) => {
  //accessControlMiddleware.check('create', 'note'),
  Note.create(req.body)
    .then((note) => res.json(note))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating note' });
    });
});

router.patch('/:id', (req, res, next) => {
  //accessControlMiddleware.check('update', 'note'),
  Note.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((note) => note.update(req.body))
    .then((note) => res.json(note))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating note' });
    });
});

router.delete('/:id', (req, res, next) => {
  //accessControlMiddleware.check("delete", "note"),
  Note.findById(req.params.id)
    .then((note) => note.update({ isDeleted: true }))
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting note' });
    });
});

router.get('/last_update', (req, res) => {
  Note.all({
    where: { organizationId: req.user.organizationId, isDeleted: false },
    order: Sequelize.literal('"Note"."updatedAt" DESC'),
    limit: 1,
  })
    .then((notes) => {
      let lastUpdate = (notes[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last updated note' });
    });
});
