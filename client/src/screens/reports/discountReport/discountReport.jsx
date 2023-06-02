import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ReactTable from 'react-table';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import CheckBox from '@material-ui/core/Checkbox';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import { flatten } from 'lodash/array';
import { sortBy, uniqBy, uniq } from 'lodash';
import Paper from '@material-ui/core/Paper';
import { capitalize } from 'lodash/string';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
import { numberToDollars } from '../../../utilities';

import Popover from '@material-ui/core/Popover';

import MenuList from '@material-ui/core/MenuList';
import { CSVLink } from 'react-csv';
import axios from 'axios';

import { discountReportStyles } from './discountReportstyles';
import SweetAlert from 'react-bootstrap-sweetalert';

class Loading extends Component {
  render() {
    return this.props.online ? (
      <div className="-loading -active">
        <div className="-loading-inner">
          <CircularProgress />
        </div>
      </div>
    ) : null;
  }
}
class discountReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discountReportList: [],
      isLoading: true,
      discountType: [],
      growerName: [],
      discountFilterList: [],
      locationData: '',
      moreFuncMenuOpen: false,
      menuList: [],
    };
  }

  componentDidMount = async () => {
    await this.setState({
      locationData: this.props.location.state,
    });
    await this.getDownloadReportList();
    setTimeout(() => {
      this.setState({
        isLoading: false,
      });
    }, 1000);
  };
  getDownloadReportList = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data) {
          try {
            const cust = response.data.customersdata;
            this.setState({ allCustomerData: response.data.customersdata });

            const discountReportList = await this.props.downloadDiscountReport();

            let totalamount = [];
            discountReportList &&
              (await discountReportList.payload.map((d) => {
                cust.map((c) => {
                  c.PurchaseOrders.filter((item) => item.isQuote === false && item.id === d.PurchaseOrderNumber).map(
                    (purchaseOrder) => {
                      const customerOrders = purchaseOrder.CustomerProducts.sort(
                        (a, b) => a.productId - b.productId,
                      ).concat(
                        purchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
                        purchaseOrder.CustomerMonsantoProducts,
                      );
                      customerOrders.length > 0 &&
                        customerOrders
                          .filter((order) => order.orderQty !== 0)
                          .filter((order) => {
                            if (order.MonsantoProduct && order.isDeleted) return null;
                            return order;
                          })
                          .forEach((order, i) => {
                            let preTotal;
                            let product;
                            let msrp;

                            if (order.Product) {
                              msrp = order.msrpEdited ? order.msrpEdited : order.Product.msrp ? order.Product.msrp : 0;
                              preTotal = order.orderQty * parseFloat(msrp || 0);
                              preTotal = preTotal;
                              product = order.Product;
                            } else if (order.CustomProduct) {
                              msrp = order.msrpEdited ? order.msrpEdited : order.CustomProduct.costUnit;
                              preTotal = order.orderQty * parseFloat(msrp || 0);
                              preTotal = preTotal;
                              product = order.CustomProduct;
                            } else if (order.MonsantoProduct) {
                              msrp = order.msrpEdited ? order.msrpEdited : order.price;
                              preTotal = order.orderQty * parseFloat(msrp || 0);
                              preTotal = preTotal;
                              product = order.MonsantoProduct;
                            }

                            const sumAllDiscount =
                              d.discountTotalObj !== undefined
                                ? Object.values(d.discountTotalObj).length !== 0
                                  ? Object.values(d.discountTotalObj).reduce((a, b) => {
                                      const d = parseFloat(a) + parseFloat(b);
                                      return d.toFixed(2);
                                    })
                                  : 0
                                : 0;

                            totalamount.push({
                              CustomerName: d.Name,
                              PurchaseOrderName: d.PurchaseOrder,
                              PurchaseOrderNumber: purchaseOrder.id,
                              preTotal: preTotal || 0,
                              ...d.discountTotalObj,
                              DiscountTotal: sumAllDiscount,
                            });
                          });
                    },
                  );
                });
              }));
            let data = [];
            let growerdata = [];
            let finalList = [];
            let discountTypeData = [];
            sortBy(totalamount && totalamount, (o) => o && o.CustomerName).reduce(function (res, value) {
              const pID = value.PurchaseOrderNumber;
              if (!res[pID]) {
                res[pID] = {
                  ...value,
                  preTotal: 0,
                };
                finalList.push(res[pID]);
              }
              res[pID].preTotal += value.preTotal || 0;

              return res;
            }, {});
            //when page render set All data to dropdown

            finalList.map((d) => data.push(Object.keys(d)));
            const merged = [].concat.apply([], data);

            const discountTypeList = await [...new Set(merged)].filter(
              (s) =>
                s !== 'CustomerName' &&
                s !== 'PurchaseOrderName' &&
                s !== 'PurchaseOrderNumber' &&
                s !== 'preTotal' &&
                s !== 'DiscountTotal',
            );
            await discountTypeList.map((name) => discountTypeData.push(name));

            await uniqBy(finalList, 'CustomerName').map((name) => growerdata.push(name.CustomerName));

            this.setState({
              discountReportList: finalList || [],

              discountFilterList: (finalList && finalList) || [],
              menuList: discountTypeList || [],
              discountType: discountTypeData.concat('All') || [],
              growerName: uniq(growerdata.concat('All')) || [],
            });
          } catch (e) {
            console.log('discount report page', e);
          }
        } else {
          console.log('nope respose: ', response);
        }
      });
  };
  handleChange = async (event, name, reportName) => {
    let data = [];
    const {
      target: { value, checked },
    } = event;

    // for acompare actual data lenght and when click on All set All data
    if (name === 'discountType') {
      await this.state.menuList.map((name) => data.push(name));
    } else {
      await uniqBy(this.state.discountReportList, 'CustomerName').map((name) => data.push(name.CustomerName));
    }
    if (value.includes('All')) {
      if (uniq(data).length === value.length && value.includes('All')) {
        await this.setState({
          [name]: value.filter((s) => s !== 'All'),
        });
      } else {
        const data1 = await data.concat('All');
        await this.setState({
          [name]: uniq(data1),
        });
      }

      if (uniq(data).length <= 1 && value.includes('All')) {
        const data1 = await data.concat('All');
        await this.setState({
          [name]: uniq(data1),
        });
      }
    } else if (value.length === this.state[name].length && !value.includes('All')) {
      await this.setState({
        [name]: [],
      });
    } else if (!value.includes('All') && uniq(data).length === this.state[name].length - 1) {
      await this.setState({
        [name]: [],
      });
    } else {
      if (uniq(data).length === value.length) {
        await this.setState({
          [name]: typeof value === 'string' ? value.split(',') : value.concat('All'),
        });
      } else {
        await this.setState({
          [name]: typeof value === 'string' ? value.split(',') : value,
        });
      }
    }

    this.setlistGrower();
  };
  handleMoreFuncMenuClose = (event) => {
    this.setState({ moreFuncMenuOpen: false });
  };
  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };
  setlistGrower = () => {
    if (this.state.growerName.length > 0 && this.state.growerName.length < this.state.discountReportList.length) {
      const data = this.state.growerName.map((d) => this.state.discountReportList.filter((s) => s.CustomerName === d));
      this.setState({
        discountFilterList: flatten(data),
      });
    } else if (this.state.growerName.length === 0) {
      this.setState({
        discountFilterList: [],
      });
    } else {
      this.setState({
        discountFilterList: this.state.discountReportList,
      });
    }
  };

  print = async () => {
    setTimeout(() => {
      const tempTitle = document.title;
      document.title = 'Delivery Invoice';
      window.print();
      document.title = tempTitle;
      this.setState({ isPrinting: false });
    }, 500);
  };

  getTrProps = (state, rowInfo, instance) => {
    if (rowInfo) {
      return {
        style: {
          'background-color': rowInfo.original.CustomerName === '-' ? '#307a0830' : '',
          fontWeight: rowInfo.original.CustomerName === '-' ? 900 : '',
        },
      };
    }
    return {};
  };

  render() {
    const { classes, organizationId } = this.props;
    const {
      discountReportList,
      discountType,
      growerName,
      discountFilterList,
      allCustomerData,
      locationData,
      menuList,
      moreFuncMenuOpen,
      growerField,
    } = this.state;

    if (this.state.isLoading) {
      return <CircularProgress />;
    }

    let discountReportHeader = [];
    let finalHeader = [];
    let finalData = [];
    let data = [];
    this.state.discountReportList.map((d) => data.push(Object.keys(d)));
    const merged = [].concat.apply([], data);
    let csvHeadersDiscount = [];
    let tableHeader = [];

    if (discountType.length > 0 && this.state.discountType.length < menuList.length) {
      const data = ['CustomerName', 'PurchaseOrderName', 'PurchaseOrderNumber', 'preTotal'].concat(discountType);
      tableHeader = data;
    } else if (discountType.length === 0) {
      tableHeader = [...new Set(merged)].filter(function (obj) {
        return menuList.indexOf(obj) == -1;
      });
    } else {
      tableHeader = [...new Set(merged)];
    }
    tableHeader = tableHeader.filter((item) => item !== 'DiscountTotal');

    finalData = sortBy(discountFilterList, (o) => o && o.CustomerName) || [];

    [...tableHeader, 'DiscountTotal'].map((s) => {
      discountReportHeader.push({
        Header: s,
        id: s,
        // accessor: s,
        accessor: (d) => d,
        Cell: (props) => {
          return (
            <div style={{ cursor: 'pointer' }}>
              {s === 'CustomerName' || s === 'PurchaseOrderName' || s === 'PurchaseOrderNumber'
                ? props.value[s]
                : numberToDollars(props.value[s] || 0)}
            </div>
          );
        },
        headerStyle: {
          fontSize: '15px',
          fontWeight: 'bold',
          textTransform: 'capitalize',
        },
      });
      csvHeadersDiscount.push({
        label: s,
        key: s,
      });
    });
    finalHeader = discountReportHeader;

    let totalrow = {
      CustomerName: '-',
      PurchaseOrderName: '-',
      PurchaseOrderNumber: '-',
    };
    [...tableHeader, 'DiscountTotal']
      .filter((t) => t !== 'CustomerName' && t !== 'PurchaseOrderName' && t !== 'PurchaseOrderNumber')
      .map((key) => {
        const data = finalData
          .map((item) => item[key])
          .reduce((prev, curr) => {
            return parseFloat(prev === undefined ? 0 : prev) + parseFloat(curr === undefined ? 0 : curr);
          }, 0);

        totalrow[key] = data.toFixed(2);
      });

    finalData.splice(0, 0, totalrow);

    let csvdata = [];
    finalData.map(async (s) => {
      let data = {};
      Object.keys(s).map((d) => {
        if (d !== 'CustomerName' && d !== 'PurchaseOrderName' && d !== 'PurchaseOrderNumber') {
          data[d] = numberToDollars(s[d] || 0);
        } else {
          data[d] = s[d];
        }
      });
      return csvdata.push(data);
    });

    return (
      <div>
        <h3 className={classes.cardIconTitle}> Discount Report</h3>

        <Card>
          <CardBody className={classes.cardBody}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <FormControl style={{ maxWidth: '200px', minWidth: '160px', marginRight: '50px' }}>
                  <InputLabel id="demo-multiple-checkbox-label">Filter By Discount</InputLabel>
                  <Select
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    value={discountType}
                    onChange={(e) => this.handleChange(e, 'discountType')}
                    input={<OutlinedInput label="Discount" />}
                    renderValue={(selected) => selected.join(', ')}
                    // MenuProps={MenuProps}
                  >
                    <MenuItem key={'All'} value={'All'}>
                      <Checkbox checked={discountType.indexOf('All') > -1} />
                      <ListItemText primary={'All'} />
                    </MenuItem>
                    {menuList.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={discountType.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl style={{ maxWidth: '200px', minWidth: '160px', marginRight: '50px' }}>
                  <InputLabel id="demo-multiple-checkbox-label">Filter By Grower</InputLabel>
                  <Select
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    value={growerName}
                    onChange={(e) => this.handleChange(e, 'growerName')}
                    input={<OutlinedInput label="Grower" />}
                    renderValue={(selected) => selected.join(', ')}
                    // MenuProps={MenuProps}
                  >
                    <MenuItem key={'All'} value={'All'}>
                      <Checkbox checked={growerName.indexOf('All') > -1} />
                      <ListItemText primary={'All'} />
                    </MenuItem>
                    {uniqBy(discountReportList, 'CustomerName').map((name) => (
                      <MenuItem key={name.CustomerName} value={name.CustomerName}>
                        <Checkbox checked={growerName.indexOf(name.CustomerName) > -1} />
                        <ListItemText primary={name.CustomerName} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <Button
                id="customerDot"
                className={`${classes.iconButton} hide-print`}
                variant="contained"
                style={{ width: '50px' }}
                color="primary"
                align="right"
                buttonRef={(node) => {
                  this.moreFuncMenuAnchorEl = node;
                }}
                onClick={this.handleMoreFuncMenuToggle}
              >
                <MoreHorizontalIcon />
              </Button>
            </div>
            <div id="discountTable">
              {finalData.length > 0 ? (
                <ReactTable
                  data={finalData}
                  columns={finalHeader}
                  minRows={1}
                  showPagination={false}
                  LoadingComponent={Loading}
                  loading={true}
                  getTrProps={this.getTrProps}
                  // pageSize={finalData.length >= 50 ? 50 : finalData.length}
                />
              ) : (
                <p className={classes.noFoundMsg}>No Record Found</p>
              )}
            </div>
          </CardBody>
        </Card>

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
              <MenuItem className={classes.addNewMenuItem} id="downloadCsv">
                <CSVLink
                  data={csvdata}
                  style={{ color: '#2F2E2E' }}
                  filename={`discountReport-${organizationId}.csv`}
                  headers={csvHeadersDiscount}
                >
                  <span>Download CSV</span>
                </CSVLink>
              </MenuItem>
              <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  this.props.history.push({
                    pathname: `/app/bayer_orders_preview/discountReport`,
                    state: csvdata,
                  });
                }}
                id="dataPDF"
              >
                Download Data (PDF)
              </MenuItem>
            </MenuList>
          </Paper>
        </Popover>
      </div>
    );
  }
}
export default withStyles(discountReportStyles)(discountReport);
