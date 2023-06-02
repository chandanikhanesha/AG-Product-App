import { connect } from 'react-redux';

import NewQuote from './new_quote';

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
  };
};

export default connect(mapStateToProps, null)(NewQuote);
