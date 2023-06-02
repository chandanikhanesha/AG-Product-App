const { Router } = require('express');
const stripe = require('stripe')(
  'sk_test_51IitsxDSma7kaJdNgYPEe9kBxWf691Gm5LFlV0clSOPIXtoc3RvmW2J3zNk2rJgt5dKfklo65us4PjyO66w6T0Hk00LQHlUPIw',
);
const { Organization, Subscriptions } = require('models');

const authMiddleware = require('../middleware/userAuth');
const adminMiddleware = require('middleware/admin');

const router = (module.exports = Router().use(authMiddleware).use(adminMiddleware));

router.post('/charge', async (req, res) => {
  const { items, id, selectedPlanNames } = req.body;
  try {
    const organization = await Organization.findById(req.user.organizationId);
    const custId = organization.stripCustomerId;
    const paymentMethod = await stripe.paymentMethods.attach(id, { customer: custId });
    await stripe.customers.update(custId, { invoice_settings: { default_payment_method: paymentMethod.id } });
    const payment = await stripe.subscriptions.create({
      customer: custId,
      items,
    });
    const todayDate = new Date();

    if (organization.subscriptionID) {
      const oldsubscription = await Subscriptions.findById(organization.subscriptionID);
      oldsubscription.planNames = JSON.stringify(selectedPlanNames);
      oldsubscription.subscription_start_timestamp = todayDate;
      oldsubscription.subscription_end_timestamp = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth() + 1,
        todayDate.getDate(),
      );
      await oldsubscription.save();
    } else {
      const createdsubscription = await Subscriptions.create({
        organizationId: req.user.organizationId,
        planNames: JSON.stringify(selectedPlanNames),
        subscription_start_timestamp: todayDate,
        subscription_end_timestamp: new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, todayDate.getDate()),
      });
      organization.subscriptionID = createdsubscription.id;
      await organization.save();
    }

    res.json({
      message: 'Payment Successful',
      success: true,
      payment: payment,
    });
  } catch (error) {
    console.log('stripe error', error);
    res.json({
      message: 'Payment Failed',
      success: false,
      error: error.raw.message || error,
    });
  }
});

router.post('/chargeOffline', async (req, res) => {
  const { items, id, selectedPlanNames } = req.body;
  try {
    const organization = await Organization.findById(req.user.organizationId);

    const todayDate = new Date();

    if (organization.subscriptionID) {
      const oldsubscription = await Subscriptions.findById(organization.subscriptionID);
      oldsubscription.planNames = JSON.stringify(selectedPlanNames);
      oldsubscription.subscription_start_timestamp = todayDate;
      oldsubscription.subscription_end_timestamp = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth() + 1,
        todayDate.getDate(),
      );
      await oldsubscription.save();
    } else {
      const createdsubscription = await Subscriptions.create({
        organizationId: req.user.organizationId,
        planNames: JSON.stringify(selectedPlanNames),
        paymentMode: 'cheque',
        subscription_start_timestamp: todayDate,
        subscription_end_timestamp: new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, todayDate.getDate()),
      });
      organization.subscriptionID = createdsubscription.id;
      await organization.save();
    }

    res.json({
      message: 'Payment Successful',
      success: true,
      payment: payment,
    });
  } catch (error) {
    console.log('offline payment error', error);
    res.json({
      message: 'Payment Failed',
      success: false,
      error: error.raw.message || error,
    });
  }
});

router.get('/allPlans', async (req, res) => {
  try {
    const { data } = await stripe.prices.list();
    res.json({
      data,
    });
  } catch (error) {
    res.json({
      message: 'Payment Failed',
      success: false,
    });
  }
});
