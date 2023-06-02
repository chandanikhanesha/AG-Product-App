const { Router } = require('express');
const passport = require('passport');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(
  'sk_test_51IitsxDSma7kaJdNgYPEe9kBxWf691Gm5LFlV0clSOPIXtoc3RvmW2J3zNk2rJgt5dKfklo65us4PjyO66w6T0Hk00LQHlUPIw',
);

const { User, BannerMsg, Organization, ...db } = require('models');

const router = (module.exports = Router());

router.get('/invite', check('token').exists(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  jwt.verify(req.query.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(400).json({ error: 'Invalid invite token' });

    User.findOne({
      where: { email: decoded.email },
    })
      .then((user) => {
        res.json({ user: user });
      })
      .catch((e) => res.status(400).json({ error: 'Invalid invite token' }));
  });
});

router.post(
  '/accept_invite',
  check('inviteToken').exists(),
  check('firstName').exists(),
  check('lastName').exists(),
  check('email').exists().isEmail(),
  check('password').isLength({ min: 8 }),
  check('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) return Promise.reject('Passwords do not match');
    return Promise.resolve();
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    jwt.verify(req.body.inviteToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(400).json({ error: 'Invalid invite token' });

      User.findOne({
        where: { email: decoded.email },
      })
        .then((user) => user.setPassword(req.body.password))
        .then((user) => {
          let updateObject = Object.assign({}, user.dataValues, req.body);
          updateObject.verificationDate = new Date();
          return user.update(updateObject).then((updatedUser) => {
            return res.json({ user: updatedUser.present() });
          });
        })
        .catch((e) => {
          console.log('error : ', e);
          return res.status(401).json({ error: 'Error accepting invite' });
        });
    });
  },
);

router.post(
  '/sign_in',
  check('email').exists().isEmail(),
  check('password').exists(),
  sanitizeBody('email').normalizeEmail({ gmail_remove_dots: false }),
  (req, res, next) => {
    const errors = validationResult(req);
    // if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' })

    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ success: false, message: info.message });
      }

      if (!user.verificationDate) {
        return res.status(401).json({
          success: false,
          message: 'Email not verified.  Please check your email and click on the verification link.',
        });
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) return res.status(401).json({ success: false, message: loginErr });

        user
          .save()
          .then(() => {
            return res.json({
              success: true,
              message: 'authentication succeeded',
              user: user.present(),
            });
          })
          .then(async () => {
            const isExits = await BannerMsg.findOne({
              where: {
                organizationId: user.organizationId,
                userId: user.id,
              },
            });

            if (!isExits) {
              BannerMsg.create({
                organizationId: user.organizationId,
                userId: user.id,
                userName: user.firstName + user.lastName,

                bannerMsg: 'Banner msg Demo',
                showBannerFlagDate: new Date(),
                bannerStartDate: new Date(),
                bannerEndDate: new Date(),
              });
            }
          });
      });
    })(req, res, next);
  },
);

router.post('/sign_up', check('organization').exists(), check('user').exists(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Invalid request' });

  let organization;

  Organization.create(req.body.organization)
    .then((org) => {
      organization = org;
      let userAttributes = Object.assign({}, req.body.user, {
        organizationId: org.id,
      });
      userAttributes.isAdmin = true;
      userAttributes.isMultipleAccess = false;
      return User.create(userAttributes);
    })
    .then((user) => user.setPassword(req.body.user.password))
    .then((user) => user.save())
    .then((user) => {
      return user.sendConfirmationEmail();
    })
    .then(async (user) => {
      // uncomnnet the code if add the subscription
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        description: 'Created by strip using agri-dealr API',
      });
      await Organization.update({ stripCustomerId: customer.id }, { where: { id: organization.id } });
      return res.json({ ok: 'ok' });
    })
    .catch((e) => {
      console.log('signup error : ', e);
      if (organization && organization.id) organization.destroy();
      if (e.errors && e.errors[0].path === 'email') {
        return res.status(422).json({
          errors:
            'This email address is already in use. \n Please log in with this email address or use a different email address to sign up.',
        });
      } else {
        return res.status(422).json({
          errors: 'Something went wrong',
        });
      }
    });
});

router.get('/confirm', check('token').exists(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Invalid request' });

  jwt.verify(req.query.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(400).json({ error: 'Invalid token' });

    User.findOne({
      where: { email: decoded.email },
    })
      .then((user) => user.update({ verificationDate: new Date() }))
      .then(() => res.json({ ok: 'ok' }))
      .catch((e) => {
        console.log('error : ', e);
        res.status(400).json({ error: 'Invalid token' });
      });
  });
});
