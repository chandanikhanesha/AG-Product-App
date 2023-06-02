const { Router } = require('express');
const { check, validationResult } = require('express-validator/check');
const authMiddleware = require('middleware/userAuth');
//const accessControlMiddleware = require('../middleware/accessControlCheck')
const { create: transferLog } = require('../middleware/transferLog');

const { User } = require('models');

const router = (module.exports = Router().use(authMiddleware));

router.get('/:id/permissions', (req, res, next) => {
  if (!req.user.isAdmin && !req.user.id !== req.params.id) return res.status(401).json({ errors: 'Not authorized' });

  User.findById(req.params.id)
    .then((user) => res.json({ permissions: user.isAdmin }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(401).json({ errors: 'Not authorized' });
    });
});

router.get('/:id', (req, res, next) => {
  if (req.user.isAdmin || req.user.id.toString() === req.params.id) {
    User.findById(req.params.id)
      .then((user) => res.json({ user: user }))
      .catch((e) => {
        console.log('error : ', e);
        res.status(404).json({ errors: 'User not found' });
      });
  } else {
    return res.status(401).json({ errors: 'Not authorized' });
  }
});

router.patch('/update/:id', (req, res, next) => {
  if (req.user.isAdmin || req.user.id.toString() === req.params.id) {
    User.findById(req.params.id)
      .then((user) => {
        return user.update({ organizationId: req.body.organizationId });
      })
      .then((updateUser) => res.json({ user: updateUser }))
      .catch((e) => {
        console.log('error : ', e);
        res.status(404).json({ errors: 'User not found' });
      });
  } else {
    return res.status(401).json({ errors: 'Not authorized' });
  }
});

router.patch(
  '/:id',
  check('firstName').exists(),
  check('lastName').exists(),
  check('password').isLength({ min: 8 }).optional(),
  check('passwordConfirmation').custom((value, { req }) => {
    if (value && req.body.password && value !== req.body.password) return Promise.reject('Password do not match');
    return Promise.resolve();
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    // if (!req.user.isAdmin && !req.user.id !== req.params.id)
    //   return res.status(401).json({errors: 'Not authorized'})

    if (req.user.id != req.params.id) return res.status(401).json({ errors: 'Not authorized' });

    // if (req.user.role !== 'admin') {
    //   if (req.body.role || req.body.isAdmin) {
    //     return res.status(403).json({
    //       errors: 'Not authorized'
    //     })
    //   }
    // }

    let updatePassword = false;
    if (req.body.password && req.body.passwordConfirmation && req.body.password === req.body.passwordConfirmation)
      updatePassword = true;

    User.findById(req.params.id)
      .then((user) => {
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        if (updatePassword) return user.setPassword(req.body.password);
        return Promise.resolve(user);
      })
      .then((user) => {
        let updateObj = {
          firstName: user.firstName,
          lastName: user.lastName,
          encryptedPassword: user.encryptedPassword,
          ...(req.body.role ? { role: req.body.role } : {}),
          ...(req.body.isAdmin ? { isAdmin: req.body.isAdmin } : {}),
        };
        return user.update(updateObj);
      })
      .then((updatedUser) => {
        transferLog({
          req,
          productName: 'User Update',
          action: {
            UpdateRow: `User Updated succesfully `,
          },
          otherDetail: {
            Status: 'Done',
            updatedUserData: req.body,
          },
          purchaseOrderId: null,
          productId: null,
          rowId: req.params.id,
        });

        return res.json({ user: updatedUser });
      })
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ errors: 'Error updating user' });
      });
  },
);
