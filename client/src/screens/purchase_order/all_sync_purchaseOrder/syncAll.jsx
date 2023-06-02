import React, { Component } from 'react';
import { listDeliveryReceipts, listCustomers, syncMonsantoOrders } from '../../../store/actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactTable from 'react-table';
import CheckBox from '@material-ui/core/Checkbox';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '../../../components/material-dashboard/CustomButtons/Button';

class SyncAll extends Component {
  state = {
    checkPoId: [],
    isSyncingMonsantoProducts: false,
    errormsgs: [],
  };

  componentDidMount = async () => {
    await this.props.listCustomers(true);
    this.props.listDeliveryReceipts();
  };

  syncMonsantoOrders = async () => {
    const { customers } = this.props;
    const { checkPoId } = this.state;

    let syncPoList = [];
    let errormsgs = [];
    customers.map((c) => {
      c.PurchaseOrders.map((f) => {
        if (checkPoId.includes(f.id)) {
          return syncPoList.push(f);
        }
      });
    });
    syncPoList.map(async (sp) => {
      let syncMonsantoProductIds = [];
      await sp.CustomerMonsantoProducts.filter(
        (cm) => cm.isSent == false && cm.isDeleted == false && parseFloat(cm.orderQty) >= 0,
      ).map((c) => {
        return syncMonsantoProductIds.push(c.id);
      });

      await this.props
        .syncMonsantoOrders(sp.id, sp.customerId, [], syncMonsantoProductIds, this.props.match.path.includes('dealers'))
        .then(async (data) => {
          this.setState({ isSyncingMonsantoProducts: false });
          errormsgs.push({
            pid: sp.id,
            msg: data.msg || 'Sync with Bayer Done! Some products are not available for now!',
          });
          this.setShowSnackbar('Sync with Bayer Done! Some products are not available for now!');

          this.setShowSnackbar(data.msg || '');

          setTimeout(async () => {
            await this.props.listCustomers(true);
          }, 2000);
        })
        .catch((e) => {
          this.setState({ isSyncingMonsantoProducts: false });
          if (e && e.response) {
            errormsgs.push({
              pid: sp.id,
              msg: e.response.data.error || 'Cannot sync with Monsanto! Please try later!',
            });
            this.setShowSnackbar(e.response.data.error || 'Cannot sync with Monsanto! Please try later!');
          } else {
            errormsgs.push({
              pid: sp.id,
              msg: 'The Bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.',
            });
            this.setShowSnackbar(
              'The Bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.',
            );
          }
        });
    });

    this.setState({
      isSyncingMonsantoProducts: true,
      errormsgs: errormsgs,
      // isCheckingProductAvailability: true
    });
  };

  setShowSnackbar = (showSnackbarText) => {
    this.setState({
      showSnackbar: true,
      showSnackbarText: showSnackbarText,
    });
  };
  render() {
    const { customers } = this.props;
    const { selectAll, checkPoId, showSnackbar, showSnackbarText, isSyncingMonsantoProducts, errormsgs } = this.state;

    let poList = [];
    customers.map(
      (c) =>
        c.PurchaseOrders.length > 0 &&
        c.PurchaseOrders.filter((o) => o.isQuote === false).map((p) => {
          return (
            p.CustomerMonsantoProducts.filter(
              (d) => d.isSent === false && parseFloat(d.orderQty) >= 0 && d.isDeleted === false,
            ).length > 0 && poList.push(p.id)
          );
        }),
    );

    return (
      <div>
        <h3>Multiple Sync PurchaseOrder</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            <CheckBox
              id="selectPOforsync"
              color="primary"
              value={selectAll}
              checked={checkPoId.length == poList.length ? true : false}
              onChange={(e) =>
                this.setState({
                  checkPoId: e.target.checked ? poList : [],
                })
              }
            />
            <p style={{ display: 'flex', alignItems: 'center', fontSize: '15px', marginTop: '9px' }}>Select All</p>
          </div>
          <Button
            id="syncwithbayer"
            onClick={this.syncMonsantoOrders}
            disabled={isSyncingMonsantoProducts || checkPoId.length == 0}
          >
            {isSyncingMonsantoProducts ? 'Syncing With Bayer' : 'Sync With Bayer'}
          </Button>
        </div>
        {customers.map(
          (c) =>
            c.PurchaseOrders.length > 0 &&
            c.PurchaseOrders.filter((o) => o.isQuote === false).map((p) => {
              let tableHeaders = [
                {
                  Header: (
                    <span>
                      <CheckBox
                        id="selectPOforsync"
                        color="primary"
                        checked={checkPoId.includes(p.id) ? true : false}
                        onChange={async (e) => {
                          if (e.target.checked) {
                            this.setState({ checkPoId: [...this.state.checkPoId, p.id] });
                          } else {
                            this.setState({ checkPoId: checkPoId.filter((d) => d !== p.id) });
                          }
                        }}
                      />
                    </span>
                  ),
                  show: true,
                  id: 'checkbox',
                  width: 60,
                  accessor: (d) => d,
                  Cell: (props) => {},
                },
                {
                  Header: <span>{c.name}</span>,
                  show: true,
                  id: 'cname',
                  width: 200,

                  accessor: (d) => d,
                  Cell: (props) => {
                    const product = props.value;

                    return (
                      <p>
                        {product.MonsantoProduct.productDetail
                          ? product.MonsantoProduct.productDetail
                          : `${product.MonsantoProduct.blend} ${product.Monsantoproduct.brand} ${product.Monsantoproduct.treatment}`}
                      </p>
                    );
                  },
                },
                {
                  Header: <span>#PO-{p.id}</span>,
                  show: true,
                  id: 'poid',
                  width: 160,

                  accessor: (d) => d,
                  Cell: (props) => {
                    const product = props.value;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <b> BeforeQty</b>
                        <p>{product.monsantoOrderQty == null ? 0 : product.monsantoOrderQty || 0}</p>
                      </div>
                    );
                  },
                },
                {
                  Header: <span>{p.name}</span>,
                  show: true,
                  id: 'poname',
                  width: 160,
                  accessor: (d) => d,
                  Cell: (props) => {
                    const product = props.value;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <b> AfterQty</b>
                        <p>{product.orderQty == null ? 0 : product.orderQty || 0}</p>
                      </div>
                    );
                  },
                },
                {
                  Header: (
                    <span>
                      Status -{' '}
                      {errormsgs.length > 0 &&
                        errormsgs.filter((e) => e.pid == p.id).length > 0 &&
                        errormsgs.filter((e) => e.pid == p.id)[0].msg}
                    </span>
                  ),
                  show: true,
                  id: 'status',
                  width: 500,
                  headerStyle: {
                    textAlign: 'left',
                    overflow: 'auto',
                  },
                  accessor: (d) => d,
                  Cell: (props) => {},
                },
              ];

              return (
                p.CustomerMonsantoProducts.filter(
                  (d) => d && d.isSent === false && parseFloat(d.orderQty) >= 0 && d.isDeleted === false,
                ).length > 0 && (
                  <ReactTable
                    columns={tableHeaders}
                    data={p.CustomerMonsantoProducts.filter(
                      (d) => d && d.isSent === false && parseFloat(d.orderQty) >= 0 && d.isDeleted === false,
                    )}
                    showPagination={false}
                    minRows={1}
                    resizable={false}
                  ></ReactTable>
                )
              );
            }),
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          message={<span style={{ whiteSpace: 'pre-line' }}>{showSnackbarText}</span>}
          onClick={() => this.setState({ showSnackbar: false })}
          onClose={() => this.setState({ showSnackbar: false })}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    companies: state.companyReducer.companies,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    totalItemsOfCustomers: state.customerReducer.totalItems,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listDeliveryReceipts,
      listCustomers,
      syncMonsantoOrders,
    },
    dispatch,
  );
export default connect(mapStateToProps, mapDispatchToProps)(SyncAll);
