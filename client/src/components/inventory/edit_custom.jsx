import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CustomProductForm from './custom_form';

import { updateCustomProduct } from '../../store/actions';

class EditCustomProduct extends Component {
  state = {
    id: null,
    name: '',
    type: '',
    description: '',
    customId: '',
    unit: '',
    costUnit: 0,
    quantity: 0,
    loaded: false,
  };

  updateProduct = (e) => {
    e.preventDefault();

    const { updateCustomProduct } = this.props;
    const { id, name, type, description, unit, customId, costUnit, quantity } = this.state;
    const companyId = this.props.match.params.company_id;

    updateCustomProduct({ id, name, type, description, unit, customId, costUnit, quantity }).then(() =>
      this.props.history.push(`/app/companies/${companyId}`),
    );
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  componentWillMount() {
    const { products } = this.props;
    const product = products.find((p) => p.id.toString() === this.props.match.params.id);
    if (product) {
      const { id, name, type, description, unit, customId, costUnit, quantity } = product;
      this.setState({ id, name, type, description, unit, customId, costUnit, quantity, loaded: true });
    }
  }

  componentWillUpdate() {
    const { loaded } = this.state;
    if (loaded) return;

    const { products } = this.props;
    const product = products.find((p) => p.id.toString() === this.props.match.params.id);
    if (product) {
      const { id, name, type, description, unit, customId, costUnit, quantity } = product;
      this.setState({ id, name, type, description, unit, customId, costUnit, quantity, loaded: true });
    }
  }

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
          onSubmit={this.updateProduct}
          buttonText="Update"
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
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateCustomProduct,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(EditCustomProduct);
