import PropTypes from 'prop-types';
import ProductDialog from './product_dialog-v2';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { checkinOrderProductAvailability, listFarms, listCustomers } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    customerProducts: state.customerProductReducer.customerProducts,
    customers: state.customerReducer.customers.filter(
      (customer) => customer.organizationId === parseInt(state.userReducer.organizationId, 10),
    ),
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ checkinOrderProductAvailability, listFarms, listCustomers }, dispatch);

ProductDialog.displayName = 'ProductDialogV2';
ProductDialog.propTypes = {
  companies: PropTypes.array.isRequired,
  seedCompanies: PropTypes.array.isRequired,
  apiSeedCompanies: PropTypes.array.isRequired,
  customerOrders: PropTypes.array.isRequired,
  dealerDiscounts: PropTypes.array.isRequired,
  discountPackages: PropTypes.array.isRequired,
  editingProduct: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  business: PropTypes.array.isRequired,
  quantity: PropTypes.number,
  discounts: PropTypes.array,
  onAddProducts: PropTypes.func.isRequired,
  onEditProduct: PropTypes.func.isRequired,
  type: PropTypes.string,
  fieldNames: PropTypes.array,
  purchaseOrder: PropTypes.object.isRequired,
  // provided by withStyles HoC
  classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductDialog);
