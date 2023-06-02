import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import { withStyles, CircularProgress } from '@material-ui/core';

// core components
import Tabs from '../../components/material-dashboard/CustomTabs/CustomTabs';

import ProductTable from '../../components/inventory/product_table';
import CompanyEditModal from './edit';
import {
  deleteCustomProduct,
  listAllCustomProducts,
  deleteCompany,
  listSeasons,
  updateCustomProduct,
  createCustomProduct,
  listProductDealers,
} from '../../store/actions';
import { isUnloadedOrLoading } from '../../utilities';

import sweetAlertStyle from '../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

const styles = Object.assign({}, sweetAlertStyle, {
  logoContainer: {
    display: 'inline-block',
  },
  logo: {
    maxHeight: '100px',
    maxWidth: '120px',
  },
  contentTitle: {
    lineHeight: '1.333333333333',
    fontSize: 18,
    fontWeight: 400,
    margin: '0 0 6px 0',
    color: '#777',
  },
  companyName: {
    lineHeight: `1.3625`,
    fontSize: 36,
  },
});

class ShowCompany extends Component {
  state = {
    company: null,
    editModalOpen: false,
    deleteCompanyConfirm: null,
    deleteProductConfirm: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      isprint: false,
    };
  }

  componentWillMount = async () => {
    const { companies, listAllCustomProducts, listSeasons, listProductDealers } = this.props;
    await listAllCustomProducts();
    await listSeasons();
    await listProductDealers();

    this.setState({
      company: companies.find((co) => {
        let split = this.props.match.path.split('/');
        return co.id.toString() === split[split.length - 1];
      }),
    });
  };

  get isLoading() {
    const loading = [
      //this.props.companiesStatus,
      this.props.customProductsStatus,
      this.props.seasonsStatus,
      //this.props.deliveryReceiptsStatus,
    ].some(isUnloadedOrLoading);

    return loading;
  }

  deleteProduct = (product) => {
    const { listAllCustomProducts, deleteCustomProduct, classes } = this.props;
    this.setState({
      deleteProductConfirm: (
        <SweetAlert
          warning
          showCancel
          title="Delete Product"
          onConfirm={async () => {
            try {
              await deleteCustomProduct(product).then(async () => {
                await listAllCustomProducts(true);
                this.setState({ deleteProductConfirm: null });
              });
            } catch (err) {
              this.setState({
                deleteProductConfirm: (
                  <SweetAlert
                    warning
                    showCancel
                    title="Delete Product Unsucccessfully"
                    onConfirm={async () => {
                      this.setState({ deleteProductConfirm: null });
                    }}
                    onCancel={() => this.setState({ deleteProductConfirm: null })}
                    confirmBtnCssClass={classes.button + ' ' + classes.success}
                    cancelBtnCssClass={classes.button + ' ' + classes.danger}
                  >
                    This product cannot be deleted now. It may be connecting to a purchase order / quote.
                  </SweetAlert>
                ),
              });
            }
          }}
          onCancel={() => this.setState({ deleteProductConfirm: null })}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to delete this product? This will also remove the product from any purchase orders or
          quotes it has been added to.
        </SweetAlert>
      ),
    });
  };

  closeEditModal = () => {
    this.setState({
      editModalOpen: false,
    });
  };

  editCompany = () => {
    this.setState({
      editModalOpen: true,
    });
  };

  deleteCompany = () => {
    const { classes, history, deleteCompany } = this.props;
    const { company } = this.state;
    this.setState({
      deleteCompanyConfirm: (
        <SweetAlert
          warning
          showCancel
          title="Delete Seed Company"
          onConfirm={() => {
            deleteCompany(company.id, history);
          }}
          onCancel={() => this.setState({ deleteCompanyConfirm: null })}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to delete this company? This will also remove any products, discounts, products added to
          existing purchase orders and quotes.
        </SweetAlert>
      ),
    });
  };

  // print = () => {
  //   setTimeout(() => {
  //     window.print();
  //   }, 500);
  // };

  print = () => {
    this.setState({ isprint: true }, () => {
      setTimeout(() => {
        window.print();
      }, 100);
      setTimeout(() => {
        this.setState({ isprint: false });
      }, 500);
    });
  };

  render() {
    if (this.isLoading) return <CircularProgress />;
    const { company, editModalOpen, deleteCompanyConfirm, deleteProductConfirm } = this.state;
    const {
      customProducts,
      history,
      deliveryReceipts,
      organization,
      seasons,
      isAdmin,
      classes,
      createCustomProduct,
      organizationId,
      // companies
    } = this.props;

    if (!company) return null;

    return (
      <div>
        {deleteCompanyConfirm}
        {deleteProductConfirm}
        <h2 className={classes.contentTitle}>Inventory</h2>
        <span className={classes.companyName}>{company.name}</span>
        {this.state.isprint ? (
          <div className={classes.logoContainer}>
            <img
              className={classes.logo}
              alt={organization.logo}
              src={`${process.env.REACT_APP_DO_BUCKET}/${organization.logo}`}
            />
          </div>
        ) : (
          ''
        )}
        <Tabs
          headerColor="gray"
          print
          selectedTab={0}
          onTabChange={() => {}}
          tabs={[
            {
              tabName: company.name,
              tabContent: (
                <ProductTable
                  print={this.print}
                  organization={organization}
                  organizationId={organizationId}
                  seasons={seasons}
                  history={history}
                  editable={true}
                  editText="Edit Company"
                  editAction={this.editCompany}
                  deleteText="Delete Company"
                  deleteAction={this.deleteCompany}
                  companyName={company.name}
                  companyId={company.id}
                  company={company}
                  productType="custom"
                  customProducts={customProducts.filter((p) => p.companyId === company.id).sort((a, b) => a.id - b.id)}
                  updateCustomProduct={this.props.updateCustomProduct}
                  deleteProduct={this.deleteProduct}
                  deliveryReceipts={deliveryReceipts}
                  isAdmin={isAdmin === true || isAdmin === 'true'}
                  createCustomProduct={createCustomProduct}
                  listAllCustomProducts={this.props.listAllCustomProducts}
                />
              ),
            },
          ]}
        ></Tabs>

        {editModalOpen && (
          <CompanyEditModal open={editModalOpen} onClose={this.closeEditModal} company={company} history={history} />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  companies: state.companyReducer.companies,
  companiesStatus: state.companyReducer.loadingStatus,
  customProducts: state.customProductReducer.products,
  customProductsStatus: state.customProductReducer.loadingStatus,
  deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
  deliveryReceiptsStatus: state.deliveryReceiptReducer.loadingStatus,
  organization: state.organizationReducer,
  organizationId: state.userReducer.organizationId,
  seasons: state.seasonReducer.seasons,
  seasonsStatus: state.seasonReducer.loadingStatus,
  isAdmin: state.userReducer.isAdmin,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listAllCustomProducts,
      deleteCustomProduct,
      deleteCompany,
      listSeasons,
      updateCustomProduct,
      createCustomProduct,
      listProductDealers,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ShowCompany));
