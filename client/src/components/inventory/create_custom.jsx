import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CustomProductForm from './custom_form';

import { createCustomProduct } from '../../store/actions';

class CreateCustomProduct extends Component {
  state = {
    name: '',
    type: '',
    description: '',
    customId: '',
    unit: '',
    costUnit: 0,
    quantity: 0,
  };

  createProduct = (e) => {
    e.preventDefault();
    const { createCustomProduct, organizationId: organizationId } = this.props;
    const { name, type, description, unit, costUnit, quantity, customId } = this.state;
    const companyId = this.props.match.params.company_id;

    createCustomProduct({
      companyId,
      organizationId,
      name,
      type,
      description,
      unit,
      costUnit,
      quantity,
      customId,
    }).then(() => {
      this.props.history.push(`/app/companies/${companyId}`);
    });
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { history, products } = this.props;

    const seedDealers = products
      .filter((product) => product.lots && product.lots.length > 0)
      .map((product) => product.lots.filter((lot) => (lot.transferInfo ? true : false)).map((lot) => lot.transferInfo))
      .reduce((productArr, product) => {
        return productArr.concat(...product);
      }, []);

    return (
      <div>
        <CustomProductForm
          {...this.state}
          handleChange={this.handleChange}
          history={history}
          onSubmit={this.createProduct}
          buttonText="Create"
          seedDealers={seedDealers}
          companyId={this.props.match.params.company_id}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    products: state.customProductReducer.products,
    organizationId: state.userReducer.organizationId,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createCustomProduct,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CreateCustomProduct);
