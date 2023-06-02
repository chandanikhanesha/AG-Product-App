import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';

import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { subscriptionStyles } from './subscription.styles';

const stripePromise = loadStripe(
  'pk_test_51IitsxDSma7kaJdN9az6x4HNO6FSlOvWXg0tet0QDmwNU1eyLivLtUw8UtfdRm5Qy2QPyWc93z6v8GwkT0FmmyCp00i2LkrI2k',
);

class CheckoutForm extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      isSubmitting: false,
    };
  }

  componentDidMount() {
    this.props.getSubscriptionPlans().then(() => {
      const selectedItem = [];
      this.props.planList.map(({ id, nickname }) => {
        if (this.props.subscriptionPlan.includes(nickname)) {
          selectedItem.push(id);
        }
      });
      this.setState({ items: selectedItem });
    });
  }

  handleChange(e) {
    let isChecked = e.target.checked;
    if (isChecked) {
      const items = this.state.items;
      items.push(e.target.value);
      this.setState({ items });
    } else {
      const result = this.state.items.filter((item) => item !== e.target.value);
      this.setState({ items: result });
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const { stripe, elements } = this.props;
    this.setState({ isSubmitting: true });

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });
    if (!error) {
      const { id } = paymentMethod;
      const selectedPlanNames = this.props.planList
        .filter((item) => this.state.items.includes(item.id))
        .map((item) => item.nickname);
      const items = this.state.items.map((item) => ({ price: item }));

      const data = {
        items: items,
        id: id,
        selectedPlanNames,
      };
      this.props.createSubsciptionPayment(data).then((data) => {
        this.setState({ isSubmitting: true });
        window.location.reload();
      });
    } else {
      console.log(error.message);
      alert(error.message);
      this.setState({ isSubmitting: false });
    }
  };

  render() {
    const { stripe, classes } = this.props;
    const { isSubmitting } = this.state;
    return (
      <div>
        <div className={classes.cardHeaderContent}>
          <Card>
            <h3 className={classes.cardIconTitle}>Purchase Plan</h3>
            <CardBody className={classes.cardBody}>
              <form onSubmit={this.handleSubmit}>
                <FormControl component="fieldset" className={classes.formControl}>
                  <FormGroup>
                    <CardElement />
                    {this.props.planList.map(({ nickname, id, unit_amount }) => {
                      if (nickname === 'Bayer API Connectivity') {
                        if (this.props.apiSeedCompanies.length > 0) {
                          return;
                        }
                      }
                      return (
                        <FormControlLabel
                          control={<Checkbox onChange={(e) => this.handleChange(e)} value={id} />}
                          checked={this.state.items.includes(id)}
                          label={`${nickname} ($${unit_amount / 100})`}
                        />
                      );
                    })}
                  </FormGroup>
                  {isSubmitting && <CircularProgress />}
                  <FormControlLabel
                    control={
                      <Button disabled={!stripe} type="submit" variant="contained">
                        Pay
                      </Button>
                    }
                  />
                </FormControl>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

class Subscription extends Component {
  render() {
    return (
      <Elements stripe={stripePromise}>
        <ElementsConsumer>
          {({ stripe, elements }) => <CheckoutForm stripe={stripe} elements={elements} {...this.props} />}
        </ElementsConsumer>
      </Elements>
    );
  }
}

export default withStyles(subscriptionStyles)(Subscription);
