import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import qs from 'qs';

// material ui
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import { createPurchaseOrderForCustomer } from '../../store/actions';

import SimpleView from '../../assets/img/Simple-View.png';
import AdvancedView from '../../assets/img/Advanced-View.png';

const styles = {
  paper: {
    padding: 10,
  },
  card: {
    width: 200,
    margin: 10,
    cursor: 'pointer',
    '&:hover': {
      background: 'gray',
    },
    transition: 'background 1s ease',
  },
};

class CreatePurchaseOrder extends Component {
  state = {
    isQuote: false,
    subjectName: 'Purchase Order',
  };

  componentDidMount() {
    const query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
    let isQuote = query.is_quote === 'true' || this.props.match.path.includes('/quote/new');
    this.setState({
      isQuote: isQuote,
      subjectName: isQuote ? 'Quote' : 'Purchase Order',
    });
  }

  createPurchaseOrder(kind) {
    const { createPurchaseOrderForCustomer } = this.props;
    const { isQuote, subjectName } = this.state;
    const isSimple = kind === 'simple';
    const customerId = this.props.match.params.customer_id;
    const routeSubject = subjectName === 'Quote' ? 'quote' : 'purchase_order';

    createPurchaseOrderForCustomer(customerId, { isQuote, isSimple }).then((response) => {
      return this.props.history.push(`/app/customers/${customerId}/${routeSubject}/${response.payload.id}`);
    });
  }

  render() {
    const { subjectName } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <h1>Create new {subjectName}</h1>
        <Paper className={classes.paper}>
          <p>Which view would you like to use for {subjectName}?</p>
          <Card className={classes.card} onClick={() => this.createPurchaseOrder('simple')}>
            <CardContent>
              <h4>Simple</h4>
              <p>Product list is shown irrespective of Farms and Fields</p>
              <img src={SimpleView} alt="simple" width="100"></img>
            </CardContent>
          </Card>

          <Card className={classes.card} onClick={() => this.createPurchaseOrder('advanced')}>
            <CardContent>
              <h4>Advanced</h4>
              <p>Product list is grouped by farms and fields</p>
              <img src={AdvancedView} alt="advanced" />
            </CardContent>
          </Card>
        </Paper>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createPurchaseOrderForCustomer,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CreatePurchaseOrder));
