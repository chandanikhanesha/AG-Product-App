import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ProductForm from './form';
import { createProduct } from '../../store/actions';

class CreateProduct extends Component {
  state = {
    seedType: '',
    brand: '',
    blend: '',
    treatment: '',
    quantity: 0,
    msrp: 0,
    suggestions: [],
    orderAmount: 0,
    deliveredAmount: 0,
    modifiedLotRows: [],
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.seedType !== prevState.seedType) {
      // take selected seedType and create suggestions for dropdown menus
      const suggestionsSet = this.props.products.reduce(
        (obj, value) => {
          if (value.brand !== null) {
            obj.brand.add(value.brand);
          }
          if (value.blend !== null) {
            obj.blend.add(value.blend);
          }
          if (value.treatment !== null) {
            obj.treatment.add(value.treatment);
          }

          return obj;
        },
        { brand: new Set(), blend: new Set(), treatment: new Set() },
      );

      // remove dupes and tranform into format used by React Select
      const formatData = (item) => ({ value: item, label: item });

      const suggestions = {
        brand: [...suggestionsSet.brand].map(formatData),
        blend: [...suggestionsSet.blend].map(formatData),
        treatment: [...suggestionsSet.treatment].map(formatData),
      };

      this.setState({
        suggestions,
      });
    }
  }

  setLotRows = (modifiedLotRows) => {
    this.setState({
      modifiedLotRows,
    });
  };

  cancel = () => {
    const { location, history, match } = this.props;

    history.push(`/app/seed_companies/${match.params.id}?selectedTab=${location.state.selectedTab}`);
  };

  handleInputChange = (name) => (data) => {
    if (data.value == null) return;
    return this.setState({
      [name]: data.value,
    });
  };

  handleSelectChange = (name) => (data) => {
    if (data.value == null) return;
    return this.setState({
      [name]: data.value,
    });
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  createProduct = (e) => {
    e.preventDefault();

    const { seedType, brand, blend, treatment, quantity, msrp, orderAmount, deliveredAmount, modifiedLotRows } =
      this.state;
    const { createProduct, organizationId: organizationId, location, history, match } = this.props;
    const seedCompanyId = match.params.id;
    createProduct({
      seedType,
      brand,
      blend,
      treatment,
      quantity,
      msrp,
      organizationId,
      seedCompanyId,
      orderAmount,
      deliveredAmount,
      modifiedLotRows,
    }).then(() => {
      history.push(`/app/seed_companies/${match.params.id}?selectedTab=${location.state.selectedTab}`);
    });
  };

  render() {
    const { customerProducts, seedSizes, packagings, hiddenLots, deliveryReceipts, seedCompanies, products } =
      this.props;
    const seedCompany = seedCompanies.find((sc) => sc.id.toString() === this.props.match.params.id);

    const seedDealers = products
      .filter((product) => product.lots && product.lots.length > 0)
      .map((product) => product.lots.filter((lot) => (lot.transferInfo ? true : false)).map((lot) => lot.transferInfo))
      .reduce((productArr, product) => {
        return productArr.concat(...product);
      }, []);

    return (
      <div>
        <ProductForm
          onSubmit={this.createProduct}
          handleChange={this.handleChange}
          handleSelectChange={this.handleSelectChange}
          handleInputChange={this.handleInputChange}
          cancel={this.cancel}
          {...this.state}
          submitText={'Create'}
          customerProducts={customerProducts}
          seedSizes={seedSizes}
          packagings={packagings}
          product={{ lots: [] }}
          seedDealers={seedDealers}
          hiddenLots={hiddenLots}
          setLotRows={this.setLotRows}
          deliveryReceipts={deliveryReceipts}
          seedCompany={seedCompany}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    organizationId: state.userReducer.organizationId,
    hiddenLots: state.organizationReducer.hiddenLots,
    products: state.productReducer.products,
    packagings: state.packagingReducer.packagings,
    seedSizes: state.seedSizeReducer.seedSizes,
    customerProducts: state.customerProductReducer.customerProducts,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createProduct,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CreateProduct);
