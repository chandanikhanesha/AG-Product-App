const { Router } = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const authMiddleware = require('middleware/userAuth');
const adminMiddleware = require('middleware/admin');
const { User } = require('models');

const router = (module.exports = Router().use(authMiddleware).use(adminMiddleware));

router.get('/', (req, res, next) => {
  User.all({ where: { organizationId: req.user.organizationId } }).then((users) => res.json(users));
});

router.post('/invite', check('email').exists().isEmail(), sanitizeBody('email').normalizeEmail(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  User.invite(Object.assign({}, req.body, { organizationId: req.user.organizationId }))
    .then((user) => {
      res.json({ user: user });
    })
    .catch((e) => {
      res.status(400).json({ success: false, error: `Error inviting user ${e}` });
    });
});

router.delete('/:id', (req, res, next) => {
  User.destroy({ where: { id: req.param('id') } }).then((rowsDeleted) => {
    res.json({ id: req.param('id') });
  });
});
