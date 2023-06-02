const { Router } = require('express');

const adminUsersController = require('controllers/AdminUsersController');
const organizationsController = require('controllers/OrganizationsController');
const subscriptionController = require('controllers/subscriptionController');

module.exports = Router()
  .use('/users', adminUsersController)
  .use('/organizations', organizationsController)
  .use('/subscription', subscriptionController);
