import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ReactTable from 'react-table';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';

import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import CheckBox from '@material-ui/core/Checkbox';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
import { shipNoticeStyles } from './ship_notice.styles';
import SweetAlert from 'react-bootstrap-sweetalert';
import Tabs from '../../../components/material-dashboard/CustomTabsWithoutBody/CustomTabsWithoutBody';
class Loading extends Component {
  render() {
    return this.props.loading ? (
      <div className="-loading -active">
        <div className="-loading-inner">
          <CircularProgress />
        </div>
      </div>
    ) : null;
  }
}
class ShipNotice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isQtyReceived: false,
      isLotNumber: false,
      selectedRecord: null,
      acceptShipRecordIds: [],
      isAcceptingShipProducts: false,
      showSnackbar: false,
      messageForSnackBar: '',
      moreFuncMenuOpen: false,
      loading: false,
      cancelConfirm: null,
      selectedMenuTabIndex: 0,
      isLastUpdateLoading: false,
    };
  }

  getTableData = (shipNoticeList) => {
    let tableHeaders = [
      {
        Header: (
          <span>
            {this.state.selectedMenuTabIndex == 0 && (
              <CheckBox
                onChange={this.handleMonsantoProductPendingCheckboxAll()}
                // checked={this.state.syncMonsantoProductIds.includes(product.id)}
                id="selectAllShipNotice"
              />
            )}{' '}
            DeliveryNoteNumber
          </span>
        ),
        show: true,
        id: 'deliveryNoteNumber',
        accessor: 'deliveryNoteNumber',
      },
      {
        Header: 'Bill of Lading',
        show: true,
        accessor: 'shipNotice',
      },
      {
        Header: 'Lot Number',
        show: true,
        id: 'lotNumber',
        accessor: 'lotNumber',
      },
      {
        Header: 'Products',
        show: true,
        accessor: 'product',
      },
      {
        Header: 'Shipped Qty',
        show: true,
        accessor: 'quantity',
      },
      {
        Header: 'ReceivedQty',
        show: true,
        accessor: 'receivedQty',
      },
      {
        Header: 'Net Weight',
        show: true,
        accessor: 'netWeight',
      },
      {
        Header: 'Shipping Date',
        show: true,
        accessor: 'shippingDate',
        sortType: (a, b) => {
          var a1 = new Date(a).getTime();
          var b1 = new Date(b).getTime();
          if (a1 < b1) return 1;
          else if (a1 > b1) return -1;
          else return 0;
        },
      },
      {
        Header: 'Delivery Date',
        show: true,
        accessor: 'deliveryDate',
        headerStyle: { textAlign: 'left' },
        sortType: (a, b) => {
          var a1 = new Date(a).getTime();
          var b1 = new Date(b).getTime();
          if (a1 < b1) return 1;
          else if (a1 > b1) return -1;
          else return 0;
        },
      },
    ];

    let tableData = [];
    shipNoticeList
      .filter((s) => (this.state.selectedMenuTabIndex == 0 ? s.isAccepted !== true : s.isAccepted == true))
      .forEach((shipNotice) => {
        const lotNumber = () => {
          return (
            <div
              style={{ borderBottom: '1px dotted #A6A6A6', marginRight: '20px' }}
              onClick={() => {
                this.setState({ isLotNumber: true, selectedRecord: { ...shipNotice } });
              }}
            >
              {shipNotice.lotNumber}
            </div>
          );
        };
        const Quantity = () => {
          return <span style={{ marginLeft: '20px' }}>{parseInt(shipNotice.quantity)}</span>;
        };
        const ReceivedQty = () => {
          return (
            <div
              style={{ borderBottom: '1px dotted #A6A6A6', marginRight: '50px' }}
              onClick={() => {
                this.setState({ isQtyReceived: true, selectedRecord: { ...shipNotice } });
              }}
            >
              {parseInt(shipNotice.receivedQty || 0)}
            </div>
          );
        };

        const DeliveryNoteNumber = () => {
          return (
            <div>
              {shipNotice.isAccepted == null && (
                <CheckBox
                  onChange={this.handleMonsantoProductPendingCheckbox(shipNotice.id)}
                  checked={this.state.acceptShipRecordIds.includes(shipNotice.id)}
                />
              )}

              {shipNotice.deliveryNoteNumber}
            </div>
          );
        };

        tableData.push({
          shipNotice: shipNotice.shipNotice,
          lotNumber: <lotNumber />,
          product: shipNotice.Product && shipNotice.Product.productDetail,
          quantity: <Quantity />,
          receivedQty: <ReceivedQty />,
          netWeight: shipNotice.netWeight,
          shippingDate: shipNotice.shipDate ? moment.utc(shipNotice.shipDate).format('YYYY-MM-DD') : '-',
          deliveryDate: shipNotice.deliveryDate ? moment.utc(shipNotice.deliveryDate).format('YYYY-MM-DD') : '-',
          deliveryNoteNumber: <DeliveryNoteNumber />,
          isNew: shipNotice.isNew,
          productId: shipNotice.Product && shipNotice.Product.id,
          isAccepted: shipNotice.isAccepted,
        });
      });
    return { tableData, tableHeaders };
  };
  componentDidMount() {
    this.props.shipNoticeList(true);
    // this.getTheUpdate();
  }

  handleMonsantoProductPendingCheckbox = (id) => (event) => {
    const isCheck = event.target.checked;
    if (isCheck) {
      this.setState({
        acceptShipRecordIds: [...this.state.acceptShipRecordIds, id],
      });
    } else {
      this.setState({
        acceptShipRecordIds: this.state.acceptShipRecordIds.filter((r) => r != id),
      });
    }
  };

  exportCsv = (data) => {
    let csvData = '';
    const headers = [
      'DeliveryNoteNumber',
      'Bill of Lading',
      'Lot Number',
      'Products',
      'Shipped Qty',
      'ReceivedQty',
      'Net Weight',
      'Shipping Date',
      'Delivery Date',
    ];
    csvData += headers.join(',');
    csvData += '\n';
    data.forEach((shipnotice) => {
      const row = [
        shipnotice.deliveryNoteNumber,
        shipnotice.shipNotice,
        shipnotice.lotNumber,
        shipnotice.Product ? shipnotice.Product.productDetail : '',
        shipnotice.quantity,
        shipnotice.receivedQty,
        shipnotice.netWeight,
        shipnotice.shipDate ? moment.utc(shipnotice.shipDate).format('MM/DD/YYYY') : '-',
        shipnotice.deliveryDate ? moment.utc(shipnotice.deliveryDate).format('MM/DD/YYYY') : '-',
      ];
      csvData += row.join(',');
      csvData += '\n';
    });
    this.downloadCSV(csvData);
  };

  downloadCSV = (content) => {
    const a = document.createElement('a');
    const mimeType = 'text/csv;encoding:utf-8';

    if (navigator.msSaveBlob) {
      // IE10
      navigator.msSaveBlob(
        new Blob([content], {
          type: mimeType,
        }),
        'export.csv',
      );
    } else if (URL && 'download' in a) {
      //html5 A[download]
      a.href = URL.createObjectURL(
        new Blob([content], {
          type: mimeType,
        }),
      );
      a.setAttribute('download', 'export.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
    }
  };

  onSave = () => {
    const { selectedRecord } = this.state;
    const { updateMonsantoProduct } = this.props;
    console.log(selectedRecord, 'selectedRecord');
    if (selectedRecord) {
      updateMonsantoProduct(selectedRecord)
        .then(() => {
          this.props.shipNoticeList(true);
          this.setState({ showSnackbar: true, messageForSnackBar: 'Updated Successfully!' });
        })
        .catch((e) => {
          console.log(e);
          this.setState({ showSnackbar: true, messageForSnackBar: 'Something went wrong!' });
        });
    }
  };

  handleLotChange = (field) => (event) => {
    const value = event.target.value;
    this.setState((state) => ({
      selectedRecord: {
        ...state.selectedRecord,
        [field]: value,
      },
    }));
  };

  handleClose = () => {
    this.setState({ isQtyReceived: false, isLotNumber: false });
  };

  updateAcceptCheckbox = async (action) => {
    this.setState({ isAcceptingShipProducts: true, cancelConfirm: null });
    await this.props
      .updateAcceptStatus({ ids: this.state.acceptShipRecordIds, isAccepted: action })
      .then((res) => {
        this.setState({ isAcceptingShipProducts: false, acceptShipRecordIds: [] });
        this.props.shipNoticeList(true);
        console.log(res);
        this.setState({ showSnackbar: true, messageForSnackBar: 'Accepted Successfully!' });
      })
      .catch((e) => {
        this.setState({ isAcceptingShipProducts: false });
        console.log(e);
        this.setState({ showSnackbar: true, messageForSnackBar: 'Something went wrong!' });
      });
  };

  handleMonsantoProductPendingCheckboxAll = (ship_notice_list) => (event) => {
    const isCheck = event.target.checked;
    if (isCheck) {
      const cvssf = this.props.ship_notice_list.filter((lot) => {
        if (lot.isDeleted === null || lot.isDeleted === false || lot.isAccepted !== null) {
          return lot;
        } else {
          return null;
        }
      });
      const ids = [];
      cvssf.forEach((lot) => {
        ids.push(lot.id);
      });
      this.setState({
        acceptShipRecordIds: this.state.acceptShipRecordIds.concat(ids),
      });
    } else {
      this.setState({
        acceptShipRecordIds: [],
      });
    }
  };

  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };

  handleMoreFuncMenuClose = (event) => {
    this.setState({ moreFuncMenuOpen: false });
  };

  showCancelConfirmation() {
    const { classes } = this.props;
    this.setState({
      cancelConfirm: (
        <SweetAlert
          warning
          showCancel
          title="Decline Request"
          onConfirm={() => this.updateAcceptCheckbox(false)}
          onCancel={() => {
            this.setState({
              cancelConfirm: null,
            });
          }}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to cancel it
        </SweetAlert>
      ),
    });
  }

  syncShipNoticeList = async () => {
    await this.props
      .shipNoticeList(true)
      .then((res) => {
        console.log(res, 'res');
        this.setState({
          showSnackbar: true,
          messageForSnackBar: 'Sync Successfully!',
          loading: false,
        });
      })
      .catch((err) => {
        console.log(err, 'err');
        this.setState({
          showSnackbar: true,
          messageForSnackBar: 'Something went wrong!',
          loading: false,
        });
      });
  };

  onMenuTabChange = (selectedMenuTabIndex) => {
    const { purchaseOrder } = this.state;
    const seedId = this.props.match.path.split('ship-notice/')[1];

    let path = '';
    if (
      purchaseOrder &&
      this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket' && c.id == purchaseOrder.customerId)
    ) {
      path = '/app';
    } else {
      path = '/app';
    }

    if (selectedMenuTabIndex === 0) {
      this.props.history.push(`${path}/s_api_seed_companies/ship-notice/${seedId}`);
    }

    if (selectedMenuTabIndex === 1) {
      this.props.history.push(`${path}/s_api_seed_companies/ship-notice/${seedId}`);
    }

    this.setState({ selectedMenuTabIndex });
  };
  getTheUpdate = async () => {
    if (this.props.ship_notice_list.length > 0) {
      const startDate = new Date(this.props.ship_notice_list[0].updatedAt);

      const endDate = new Date();
      const seconds = Math.floor((endDate - startDate) / 1000);
      const minutes = Math.floor(seconds / 60);
      console.log('last update shipNotice [min]', minutes);
      if (minutes >= 30) {
        this.setState({
          showSnackbar: true,
          messageForSnackBar: 'Checking for updates in the background ... ',
          loading: true,
        });
        await this.props
          .syncShipNotice()
          .then((res) => {
            if (res.data.isUpdate) {
              this.setState({
                showSnackbar: true,
                messageForSnackBar: 'Hey, I will be auto refreshing the page in a few seconds since theres an update.',
                loading: false,
              });
              setTimeout(() => {
                window.location.reload();
              }, 5000);
            } else {
              this.setState({
                showSnackbar: true,
                messageForSnackBar: 'Page is up to date! and no refresh happens.',
                loading: false,
              });
            }
          })
          .catch((err) => {
            this.setState({
              showSnackbar: true,
              messageForSnackBar: 'Something went wrong!',
              loading: false,
            });
          });
      }
    }
  };

  render() {
    const { ship_notice_list, isLoading, classes, organizationId } = this.props;
    const {
      tableColumns,
      isQtyReceived,
      isLotNumber,
      selectedRecord,
      isAcceptingShipProducts,
      messageForSnackBar,
      showSnackbar,
      moreFuncMenuOpen,
      cancelConfirm,
      loading,
      selectedMenuTabIndex,
    } = this.state;
    const { tableData, tableHeaders } = this.getTableData(ship_notice_list);
    let menuTabs = [
      { tabName: 'To Be Confirmed', tabIndex: 'toBeConfirmend' },
      { tabName: 'Already Confirmed', tabIndex: 'alreadyConfirmed' },
    ];

    return (
      <div>
        {cancelConfirm}
        <h3 className={classes.cardIconTitle}> Ship Notice List</h3>
        <Tabs
          headerColor="gray"
          selectedTab={selectedMenuTabIndex}
          onTabChange={this.onMenuTabChange}
          tabs={menuTabs}
        />
        <Card>
          <CardBody className={classes.cardBody}>
            <div>
              {selectedMenuTabIndex == 0 && (
                <div>
                  <Button
                    id="acceptShipNotice"
                    onClick={() => this.updateAcceptCheckbox(true)}
                    disabled={isAcceptingShipProducts}
                    style={{ width: '150px' }}
                  >
                    {isAcceptingShipProducts ? 'Accepting' : 'Accepts'}
                  </Button>
                  <Button
                    onClick={() => this.showCancelConfirmation()}
                    disabled={isAcceptingShipProducts}
                    style={{ width: '150px' }}
                  >
                    Decline
                  </Button>
                </div>
              )}
              <Button
                id="openSyncShipNotice"
                className={`${classes.iconButton} hide-print`}
                variant="contained"
                color="primary"
                align="right"
                buttonRef={(node) => {
                  this.moreFuncMenuAnchorEl = node;
                }}
                onClick={this.handleMoreFuncMenuToggle}
                style={{
                  float: 'right',
                }}
              >
                <MoreHorizontalIcon />
              </Button>
              <Popover
                className="hide-print"
                open={moreFuncMenuOpen}
                anchorEl={this.moreFuncMenuAnchorEl}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                onClose={this.handleMoreFuncMenuClose}
              >
                <Paper>
                  <MenuList>
                    <MenuItem
                      id="syncShipNotice"
                      className={classes.addNewMenuItem}
                      onClick={() => {
                        this.setState({ loading: true });
                        this.props
                          .syncShipNotice()
                          .then((res) => {
                            this.syncShipNoticeList();
                            this.handleMoreFuncMenuClose();
                            this.syncShipNoticeList();
                          })
                          .catch((e) => {
                            console.log(e);
                            this.setState({ showSnackbar: true, messageForSnackBar: 'Something went wrong!' });
                          });
                      }}
                    >
                      Sync Ship Notice List
                    </MenuItem>
                    <MenuItem className={classes.addNewMenuItem} onClick={() => this.exportCsv(ship_notice_list)}>
                      Download Ship Notice List
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Popover>
            </div>

            <ReactTable
              data={tableData}
              columns={tableHeaders}
              defaultSorted={[
                {
                  id: 'deliveryDate',
                  desc: true,
                },
              ]}
              minRows={1}
              showPagination={true}
              LoadingComponent={Loading}
              loading={loading}
              getTrProps={(state, rowInfo) => {
                let style = {};
                // if (rowInfo ? rowInfo.original.isNew === false : false) {
                //   style = {
                //     background: '#F7F7A2',
                //   };
                // } else
                if (
                  rowInfo
                    ? rowInfo.original.productId == `99999${organizationId}` && rowInfo.original.product === 'specialID'
                    : false
                ) {
                  style = {
                    background: '#ffa00a8a',
                  };
                }
                return { style };
              }}
            />
          </CardBody>
        </Card>

        <Dialog open={isQtyReceived || isLotNumber} onClose={this.handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">{isQtyReceived ? 'Received Quantity' : 'Lot Number'}</DialogTitle>
          <DialogContent>
            <CustomInput
              labelText={isQtyReceived ? 'Received Qty' : 'Lot Number'}
              id="receivedQty"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                type: isQtyReceived ? 'number' : 'text',
                value: isQtyReceived
                  ? parseInt(selectedRecord ? selectedRecord.receivedQty : 0)
                  : selectedRecord
                  ? selectedRecord.lotNumber
                  : '',
                name: isQtyReceived ? 'receivedQty' : 'lotNumber',
                onChange: this.handleLotChange(isQtyReceived ? 'receivedQty' : 'lotNumber'),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.handleClose();
                this.onSave();
              }}
              color="primary"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          autoHideDuration={10000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          message={<span style={{ whiteSpace: 'pre-line' }}>{messageForSnackBar}</span>}
          onClick={() => this.setState({ showSnackbar: false })}
          onClose={() => this.setState({ showSnackbar: false })}
        />
      </div>
    );
  }
}

export default withStyles(shipNoticeStyles)(ShipNotice);
