import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CircularProgress from '@material-ui/core/CircularProgress';

import ProductForm from './form';
import { isUnloadedOrLoading } from '../../utilities';
import {
  updateProduct,
  addHiddenLot,
  listProducts,
  listCustomerProducts,
  listPackagings,
  listSeedSizes,
  listDeliveryReceipts,
} from '../../store/actions';

export class UpdateProduct extends Component {
  state = {
    id: null,
    seedType: '',
    brand: '',
    blend: '',
    treatment: '',
    quantity: 0,
    msrp: 0,
    loaded: false,
    suggestions: [],
    modifiedLotRows: [],
    seedCompanyId: null,
  };

  cancel = () => {
    const { location, history } = this.props;
    history.push(`/app/seed_companies/${this.state.seedCompanyId}?selectedTab=${location.state.selectedTab}`);
  };

  componentDidMount() {
    const { listProducts, listCustomerProducts, listPackagings, listSeedSizes, listDeliveryReceipts } = this.props;

    listProducts();
    listCustomerProducts();
    listPackagings();
    listSeedSizes();
    listDeliveryReceipts();
  }

  get isLoading() {
    const { deliveryReceiptsStatus, seedSizesStatus, packagingsStatus, customerProductsStatus, productsStatus } =
      this.props;

    return [deliveryReceiptsStatus, seedSizesStatus, packagingsStatus, customerProductsStatus, productsStatus].some(
      isUnloadedOrLoading,
    );
  }

  componentWillMount() {
    this.setState({
      seedCompanyId: this.props.match.params.seedCompanyId,
    });
    this.loadProduct();
  }

  setLotRows = (modifiedLotRows) => {
    this.setState({
      modifiedLotRows,
    });
  };

  loadProduct() {
    const { products } = this.props;
    const product = products.find((p) => p.id.toString() === this.props.match.params.id);
    if (product) {
      const { id, seedType, brand, blend, treatment, quantity, msrp } = product;
      this.setState({ product, id, seedType, brand, blend, treatment, quantity, msrp, loaded: true }, () => {
        const suggestionsSet = products.reduce(
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
      });
    }
  }

  componentDidUpdate() {
    const { loaded } = this.state;
    if (loaded) return;

    this.loadProduct();
  }

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
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

  updateProduct = (e) => {
    e.preventDefault();

    const { id, seedType, brand, blend, treatment, quantity, msrp, modifiedLotRows } = this.state;
    const { updateProduct, location } = this.props;
    const seedCompanyId = this.state.seedCompanyId;

    updateProduct({ id, seedType, brand, blend, treatment, quantity, msrp, modifiedLotRows, seedCompanyId }).then(
      () => {
        this.props.history.push(`/app/seed_companies/${seedCompanyId}?selectedTab=${location.state.selectedTab}`);
      },
    );
  };

  addHiddenLot = (seedSizeId, packagingId) => {
    this.props.addHiddenLot(this.props.organizationId, { seedSizeId, packagingId });
  };

  render() {
    if (this.isLoading) return <CircularProgress />;

    const { packagings, seedSizes, hiddenLots, customerProducts, deliveryReceipts, seedCompanies, products } =
      this.props;
    const seedCompany = seedCompanies.find((sc) => sc.id.toString() === this.state.seedCompanyId);

    const seedDealers = products
      .filter((product) => product.lots && product.lots.length > 0)
      .map((product) => product.lots.filter((lot) => (lot.transferInfo ? true : false)).map((lot) => lot.transferInfo))
      .reduce((productArr, product) => {
        return productArr.concat(...product);
      }, []);

    return (
      <div>
        <ProductForm
          addHiddenLot={this.addHiddenLot}
          add
          onSubmit={this.updateProduct}
          handleChange={this.handleChange}
          handleSelectChange={this.handleSelectChange}
          handleInputChange={this.handleInputChange}
          cancel={this.cancel}
          packagings={packagings}
          seedSizes={seedSizes}
          product={this.state.product}
          seedDealers={seedDealers}
          hiddenLots={hiddenLots}
          {...this.state}
          submitText={'Update'}
          setLotRows={this.setLotRows}
          customerProducts={customerProducts}
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
    productsStatus: state.productReducer.loadingStatus,
    packagings: state.packagingReducer.packagings,
    packagingsStatus: state.packagingReducer.loadingStatus,
    seedSizes: state.seedSizeReducer.seedSizes,
    seedSizesStatus: state.seedSizeReducer.loadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductsStatus: state.customerProductReducer.loadingStatus,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    deliveryReceiptsStatus: state.deliveryReceiptReducer.loadingStatus,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateProduct,
      addHiddenLot,
      listProducts,
      listCustomerProducts,
      listPackagings,
      listSeedSizes,
      listDeliveryReceipts,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UpdateProduct);
