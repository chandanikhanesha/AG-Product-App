/*
 * Create organization and user
 */
const { User, Organization } = require('models');
const password = 'swcuka11';
const firstName = 'first_name';
const lastName = 'last_name';
const email = 'shnick@gmail.com';
const organizationName = 'Test Organization';
require('dotenv').config();

module.exports = async () => {
  console.log('\nseeding organization & user...\n');

  let user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.isAdmin = true;
  user.verificationDate = new Date();

  //Create bayer organization
  return Organization.create({
    name: organizationName,
  })
    .then((newOrg) => {
      user.organizationId = newOrg.id;
      return user.setPassword(password);
    })
    .then(() => user.save())
    .catch((e) => console.log(e));
};
