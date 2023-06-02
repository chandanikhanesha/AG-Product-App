'use strict';

const bcrypt = require('bcrypt-node');
const jwt = require('jsonwebtoken');

const emailUtility = require('utilities/email');

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    encryptedPassword: DataTypes.STRING,
    organizationId: DataTypes.INTEGER,
    isAdmin: DataTypes.BOOLEAN,
    verificationDate: DataTypes.DATE,
    role: DataTypes.STRING,
    isMultipleAccess: DataTypes.BOOLEAN,
    isSuperAdmin: DataTypes.BOOLEAN,
  });

  User.associate = function (models) {
    // associations can be defined here
    User.belongsTo(models.Organization, { foreignKey: 'organizationId' });
  };

  User.invite = (data) => {
    return new Promise((resolve, reject) => {
      let user = new User({ ...data, isAdmin: data.role === 'admin' });
      user.setInviteToken();
      return user
        .save()
        .then(() => {
          setTimeout(() => {
            emailUtility.sendEmail(
              user.email,
              'invited',
              `invited go here: ${process.env.URL_BASE}/invite/${user.inviteToken}`,
              `<p>invited go here: ${process.env.URL_BASE}/invite/${user.inviteToken}<p>`,
              null,
            );
          });
          resolve(user);
        })
        .catch((e) => reject(e));
    });
  };

  User.prototype.sendConfirmationEmail = function () {
    return new Promise((resolve, reject) => {
      this.setInviteToken();
      return this.save()
        .then((user) => {
          setTimeout(() => {
            emailUtility.sendEmail(
              user.email,
              'AgriDealer - Confirm email',
              `Please follow this link to confirm your email address: ${process.env.URL_BASE}/confirm/${user.inviteToken}`,
              `<p>Please follow this link to confirm your email address:
              <a href="${process.env.URL_BASE}/confirm/${user.inviteToken}">
                ${process.env.URL_BASE}/confirm/${user.inviteToken}
              </a>
            </p>`,
              null,
            );
          });
          resolve(user);
        })
        .catch((e) => reject(e));
    });
  };

  User.prototype.setPassword = function (password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, null, null, (err, hash) => {
        if (err) return reject(err);
        this.encryptedPassword = hash;
        resolve(this);
      });
    });
  };

  User.prototype.setAuthToken = function () {
    const u = {
      id: this.id,
      email: this.email,
    };
    this.authToken = jwt.sign(u, process.env.JWT_SECRET);
  };

  User.prototype.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.encryptedPassword, (err, isMatch) => {
      if (err) return cb(err);

      cb(null, isMatch);
    });
  };

  User.prototype.setInviteToken = function () {
    const u = {
      email: this.email,
    };
    this.inviteToken = jwt.sign(u, process.env.JWT_SECRET, { expiresIn: '1h' });
  };

  User.prototype.present = function () {
    this.setAuthToken();
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      authToken: this.authToken,
      isAdmin: this.isAdmin,
      organizationId: this.organizationId,
      role: this.role,
      isMultipleAccess: this.isMultipleAccess,
      isSuperAdmin: this.isSuperAdmin,
    };
  };

  User.prototype.toJSON = function () {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isAdmin: this.isAdmin,
      organizationId: this.organizationId,
      role: this.role,
      isMultipleAccess: this.isMultipleAccess,
      isSuperAdmin: this.isSuperAdmin,
    };
  };

  User.prototype.getOrganizationInfo = function () {
    return sequelize.models.Organization.findById(this.organizationId).then((organization) => ({
      name: organization.name,
      id: organization.id,
    }));
  };

  return User;
};
