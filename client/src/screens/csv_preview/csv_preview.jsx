import React, { Component } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import ReactTable from 'react-table';
import { sortBy, uniqBy, uniq } from 'lodash';
import withStyles from '@material-ui/core/styles/withStyles';
import { customersStyles } from '../customers/customers.styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import { flatten } from 'lodash/array';
import { downloadCustomers, changeImported } from '../../store/actions/customer';
import { downloadCSV } from '../../utilities/csv';
import Paper from '@material-ui/core/Paper';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
import TextField from '@material-ui/core/TextField';

import Popover from '@material-ui/core/Popover';

import MenuList from '@material-ui/core/MenuList';
class csvPreview extends Component {
  state = {
    discountReportList: [],
    isLoading: true,
    discountType: [],
    growerName: [],
    discountFilterList: [],
    allCustomerData: [],
    locationData: '',
    menuList: [],
    seedCsvData: [],
    seedList: [],
    moreFuncMenuOpen: false,
    filterFieldName: 'none',
    serchText: '',
    startDate: '',
    endDate: '',
  };

  componentDidMount = async () => {
    await this.setState(
      {
        locationData: this.props.location.state || '',
      },
      async () => {
        await this.getDownloadReportList();
      },
    );
    setTimeout(() => {
      this.setState({
        isLoading: false,
      });
    }, 1000);
  };

  getDownloadReportList = async () => {
    const { locationData } = this.state;

    const latestReport = this.props.match.params.reportname;
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data && locationData) {
          try {
            const cust = response.data.customersdata;
            this.setState({ allCustomerData: response.data.customersdata });

            const discountReportList = await this.props.downloadDiscountReport();

            let totalamount = [];
            discountReportList &&
              discountReportList.payload.map((d) => {
                cust.map((c) => {
                  c.PurchaseOrders.filter((item) => item.isQuote === false && item.id === d.PurchaseOrderNumber).map(
                    (purchaseOrder) => {
                      const customerOrders = purchaseOrder.CustomerProducts.sort(
                        (a, b) => a.productId - b.productId,
                      ).concat(
                        purchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
                        purchaseOrder.CustomerMonsantoProducts,
                      );
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
                            msrp = order.msrpEdited ? order.msrpEdited || 0 : order.Product.msrp || 0;
                            preTotal = order.orderQty * parseFloat(msrp);
                            preTotal = preTotal.toFixed(2);
                            product = order.Product;
                          } else if (order.CustomProduct) {
                            msrp = order.msrpEdited ? order.msrpEdited : order.CustomProduct.costUnit;
                            preTotal = order.orderQty * parseFloat(msrp);
                            preTotal = preTotal.toFixed(2);
                            product = order.CustomProduct;
                          } else if (order.MonsantoProduct) {
                            msrp = order.msrpEdited ? order.msrpEdited : order.price;
                            preTotal = order.orderQty * parseFloat(msrp);
                            preTotal = preTotal.toFixed(2);
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
                            preTotal: parseFloat(preTotal),
                            ...d.discountTotalObj,
                            DiscountTotal: sumAllDiscount,
                          });
                        });
                    },
                  );
                });
              });
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
              res[pID].preTotal += value.preTotal;

              return res;
            }, {});

            //when page render set All data to dropdown
            await uniqBy(finalList, 'CustomerName').map((d) => data.push(Object.keys(d)));
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

            if (latestReport === 'DiscountReport') {
              await uniqBy(finalList, 'CustomerName').map((name) => growerdata.push(name.CustomerName));
            } else if (latestReport === 'SeedWareHouseReport') {
              await locationData.seedList.map((g) => growerdata.push(g.customer));
            } else if (latestReport === 'CustomerReport') {
              await this.state.allCustomerData.map((ac) => growerdata.push(ac.name));
            } else {
              await Object.keys(locationData.seedList[0]).map((g) => growerdata.push(g));
            }

            this.setState({
              discountReportList: finalList || [],
              discountFilterList: (finalList && finalList) || [],
              menuList: discountTypeList || [],
              discountType: discountTypeData.concat('All') || [],
              growerName: uniq(growerdata.concat('All')) || [],
            });
          } catch (e) {
            console.log('csv preview page', e);
          }
        } else {
          console.log('nope respose: ', response);
        }
      });
  };
  handleChange = async (event, name, reportName) => {
    const { locationData } = this.state;
    let data = [];
    const {
      target: { value, checked },
    } = event;

    // for acompare actual data lenght and when click on All set All data
    if (name === 'discountType') {
      await this.state.menuList.map((name) => data.push(name));
    } else if (reportName === 'DiscountReport') {
      await uniqBy(this.state.discountReportList, 'CustomerName').map((name) => data.push(name.CustomerName));
    } else if (reportName === 'CustomerReport') {
      await this.state.allCustomerData.map((ac) => data.push(ac.name));
    } else if (reportName === 'SeedWareHouseReport') {
      await locationData.seedList.map((g) => data.push(g.customer));
    } else {
      await Object.keys(locationData.seedList[0]).map((g) => data.push(g));
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

  customerHeader = [
    {
      Header: 'name',
      accessor: 'name',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'email',
      accessor: 'email',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'officePhoneNumber',
      accessor: 'officePhoneNumber',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'cellPhoneNumber',
      accessor: 'cellPhoneNumber',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'deliveryAddress',
      accessor: 'deliveryAddress',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'businessStreet',
      accessor: 'businessStreet',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'businessCity',
      accessor: 'businessCity',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'businessState',
      accessor: 'businessState',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'businessZip',
      accessor: 'businessZip',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'notes',
      accessor: 'notes',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'monsantoTechnologyId',
      accessor: 'monsantoTechnologyId',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
  ];

  seedHeader = [
    {
      Header: 'customer',
      accessor: 'customer',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'orderQty',
      accessor: 'orderQty',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'productDetail',
      accessor: 'productDetail',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'purchaseOrder',
      accessor: 'purchaseOrder',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'qtyDelivered',
      accessor: 'qtyDelivered',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'qtyRemaining',
      accessor: 'qtyRemaining',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'type',
      accessor: 'type',
      headerStyle: {
        fontSize: '15px',
        textAlign: 'left',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
  ];

  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };

  render() {
    const {
      classes,

      organizationId,
      totalPages,
      totalItemsOfCustomers,
    } = this.props;
    const {
      discountReportList,
      discountType,
      growerName,
      discountFilterList,
      allCustomerData,
      locationData,
      menuList,
      filterFieldName,
      moreFuncMenuOpen,
      serchText,
      startDate,
      endDate,
    } = this.state;
    if (this.state.isLoading) {
      return <CircularProgress />;
    }

    let discountReportHeader = [];
    let Inventory = [];
    let data = [];
    this.state.discountReportList.map((d) => data.push(Object.keys(d)));
    const latestReport = this.props.match.params.reportname;

    const merged = [].concat.apply([], data);
    let csvHeadersDiscount = [];
    let tableHeader = [];
    if (discountType.length > 0 && this.state.discountType.length < menuList.length) {
      const data = ['CustomerName', 'PurchaseOrderName', 'PurchaseOrderNumber', 'preTotal', 'DiscountTotal'].concat(
        discountType,
      );
      tableHeader = data;
    } else if (discountType.length === 0) {
      tableHeader = [...new Set(merged)].filter(function (obj) {
        return menuList.indexOf(obj) == -1;
      });
    } else {
      tableHeader = [...new Set(merged)];
    }
    let filterdata = [];

    tableHeader.map((s) => {
      discountReportHeader.push({
        Header: s,
        accessor: s,
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
    let csvHeaders = [];
    locationData !== '' &&
      locationData !== undefined &&
      locationData.seedList.length > 0 &&
      Object.keys(locationData.seedList[0] || this.props.location.state.seedList[0]).map((s) => {
        latestReport === 'TransferLog'
          ? Inventory.push({
              Header: s,

              id: s,
              headerStyle: {
                fontSize: '15px',
                fontWeight: 'bold',
                textTransform: 'capitalize',
              },
              accessor: (d) => d,
              Cell: (props) => {
                // const { classes } = this.props;
                // const customer = props.value;

                return (
                  <div style={{ cursor: 'pointer' }}>
                    {typeof props.value[s] === 'object'
                      ? Object.keys(props.value[s]).map((d) => {
                          return (
                            <p style={{ display: 'flex' }}>
                              {d}:{props.value[s][d]}
                            </p>
                          );
                        })
                      : props.value[s]}
                  </div>
                );
              },
            })
          : Inventory.push({
              Header: s,
              accessor: s,
              id: s,
              headerStyle: {
                fontSize: '15px',
                fontWeight: 'bold',
                textTransform: 'capitalize',
              },
            });

        csvHeaders.push({
          label: s,
          key: s,
        });
      });
    let customerCsvHeaders = [
      'name',
      'email',
      'officePhoneNumber',
      'cellPhoneNumber',
      'deliveryAddress',
      'businessStreet',
      'businessCity',
      'businessState',
      'businessZip',
      'monsantoTechnologyId',

      'Notes',
    ];
    let finalData = [];
    let finalHeader = [];
    let csvFileName = '';
    let filterHeader = [];

    if (latestReport === 'CustomerReport') {
      growerName.map((g) => allCustomerData.filter((ad) => ad.name === g).map((ss) => filterdata.push(ss)));
      finalData = filterdata || [];
      finalHeader = this.customerHeader;
      csvFileName = 'customer.csv';
      customerCsvHeaders.map((s) => {
        csvHeaders.push({
          label: s,
          key: s,
        });
      });
    } else if (latestReport === 'SeedWareHouseReport') {
      locationData !== undefined &&
        locationData.seedList &&
        growerName.map((g) => locationData.seedList.filter((ad) => ad.customer === g).map((ss) => filterdata.push(ss)));
      finalData = uniq(filterdata) || [];
      finalHeader = this.seedHeader;
      csvFileName = 'seedWarehouse.csv';
    } else if (latestReport === 'DiscountReport') {
      finalData = sortBy(discountFilterList, (o) => o && o.CustomerName) || [];
      finalHeader = discountReportHeader;
    } else {
      growerName.map((g) => Inventory.filter((ad) => ad.Header === g).map((ss) => filterdata.push(ss)));
      growerName.map((g) => csvHeaders.filter((ad) => ad.label === g).map((ss) => filterHeader.push(ss)));

      finalData =
        locationData !== undefined
          ? latestReport === 'TransferLog'
            ? locationData.seedList.filter((d) => {
                return filterFieldName !== 'none'
                  ? filterFieldName === 'date'
                    ? startDate === '' && endDate === ''
                      ? d
                      : new Date(d.createdAt).toLocaleDateString('en-US') >=
                          new Date(startDate).toLocaleDateString('en-US') &&
                        new Date(d.createdAt).toLocaleDateString('en-US') <=
                          new Date(endDate).toLocaleDateString('en-US')
                    : serchText !== ''
                    ? d[filterFieldName] == serchText
                    : d
                  : d;
              })
            : locationData.seedList
          : [];
      finalHeader = filterdata || [];
      csvFileName = `${latestReport}.csv`;
    }

    return (
      <div>
        <div className={classes.cardHeaderContent}>
          <h3
            className={classes.cardIconTitle}
            style={{ textTransform: 'capitalize' }}
          >{` ${this.props.match.params.reportname} Preview`}</h3>
        </div>
        <div
          className={`${classes.cardHeaderActions} hide-print`}
          style={{ justifyContent: 'space-between', marginTop: '20px' }}
        >
          <div style={{ display: 'flex' }}>
            {latestReport === 'DiscountReport' && (
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
            )}
            {latestReport === 'DiscountReport' ||
            latestReport === 'CustomerReport' ||
            latestReport === 'SeedWareHouseReport' ? (
              <FormControl style={{ maxWidth: '200px', minWidth: '160px' }}>
                <InputLabel id="demo-multiple-checkbox-label">Filter By Grower</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={growerName}
                  onChange={(e) => this.handleChange(e, 'growerName', latestReport)}
                  input={<OutlinedInput label="Grower" />}
                  renderValue={(selected) => selected.join(', ')}
                  // MenuProps={MenuProps}
                >
                  <MenuItem key={'All'} value={'All'}>
                    <Checkbox checked={growerName.indexOf('All') > -1} />
                    <ListItemText primary={'All'} />
                  </MenuItem>
                  {latestReport === 'CustomerReport'
                    ? uniqBy(allCustomerData, 'name').map((g) => (
                        <MenuItem key={g.name} value={g.name}>
                          <Checkbox checked={growerName.indexOf(g.name) > -1} />
                          <ListItemText primary={g.name} />
                        </MenuItem>
                      ))
                    : latestReport === 'DiscountReport'
                    ? uniqBy(discountReportList, 'CustomerName').map((name) => (
                        <MenuItem key={name.CustomerName} value={name.CustomerName}>
                          <Checkbox checked={growerName.indexOf(name.CustomerName) > -1} />
                          <ListItemText primary={name.CustomerName} />
                        </MenuItem>
                      ))
                    : latestReport === 'SeedWareHouseReport'
                    ? locationData !== '' &&
                      locationData !== undefined &&
                      locationData.seedList.length > 0 &&
                      uniqBy(locationData.seedList, 'customer').map((g) => (
                        <MenuItem key={g.customer} value={g.customer}>
                          <Checkbox checked={growerName.indexOf(g.customer) > -1} />
                          <ListItemText primary={g.customer} />
                        </MenuItem>
                      ))
                    : null}
                </Select>
              </FormControl>
            ) : (
              locationData && (
                <FormControl style={{ maxWidth: '200px', minWidth: '160px', marginRight: '50px' }}>
                  <InputLabel id="demo-multiple-checkbox-label">Filter By Field</InputLabel>
                  <Select
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    value={growerName}
                    onChange={(e) => this.handleChange(e, 'growerName', latestReport)}
                    input={<OutlinedInput label="Discount" />}
                    renderValue={(selected) => selected.join(', ')}
                    // MenuProps={MenuProps}
                  >
                    {locationData.seedList.length > 0 && (
                      <MenuItem key={'All'} value={'All'}>
                        <Checkbox checked={growerName.indexOf('All') > -1} />
                        <ListItemText primary={'All'} />
                      </MenuItem>
                    )}
                    {locationData.seedList.length > 0 &&
                      Object.keys(locationData.seedList[0]).map((name) => (
                        <MenuItem key={name} value={name}>
                          <Checkbox checked={growerName.indexOf(name) > -1} />
                          <ListItemText primary={name} />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )
            )}

            {latestReport === 'TransferLog' && (
              <div style={{ display: 'flex' }}>
                <FormControl
                  variant="outlined"
                  // className={classes.formControl}
                  style={{ maxWidth: '200px', minWidth: '160px' }}
                >
                  <InputLabel id="demo-simple-select-outlined-label">Select Filter</InputLabel>
                  <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={filterFieldName}
                    onChange={(e) => this.setState({ filterFieldName: e.target.value })}
                    label="Age"
                  >
                    <MenuItem value="none">
                      <em>None</em>
                    </MenuItem>
                    {['id', 'rowId', 'organizationId', 'productId', 'date', 'purchaseOrderId'].map((s) => {
                      return (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                {filterFieldName !== 'none' && filterFieldName !== 'date' && (
                  <FormControl style={{ marginRight: '7px', width: '40%', marginLeft: '20px' }}>
                    <TextField
                      className={`${classes.searchField} hide-print`}
                      margin="normal"
                      placeholder="Search"
                      value={serchText}
                      onChange={(e) => this.setState({ serchText: e.target.value })}
                      id="searchBar"
                    />
                  </FormControl>
                )}
                {filterFieldName === 'date' && (
                  <div>
                    <FormControl style={{ marginRight: '7px', width: '40%', marginLeft: '20px' }}>
                      <TextField
                        className={`${classes.searchField} hide-print`}
                        margin="normal"
                        placeholder="Start Date"
                        value={startDate}
                        onChange={(e) => this.setState({ startDate: e.target.value })}
                        id="searchBar"
                        type="date"
                      />
                    </FormControl>
                    <FormControl style={{ marginRight: '7px', width: '40%', marginLeft: '20px' }}>
                      <TextField
                        className={`${classes.searchField} hide-print`}
                        margin="normal"
                        placeholder="End Date"
                        value={endDate}
                        onChange={(e) => this.setState({ endDate: e.target.value })}
                        id="searchBar"
                        type="date"
                      />
                    </FormControl>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* <Button
            variant="contained"
            color="primary"
            buttonRef={(node) => {
              this.addNewAnchorEl = node;
            }}
            id="downloadCsv"
          >
            {latestReport === 'DiscountReport' ? (
              <CSVLink
                data={sortBy(discountFilterList, (o) => o && o.CustomerName) || []}
                style={{ color: '#2F2E2E' }}
                filename={`discountReport-${organizationId}.csv`}
                headers={csvHeadersDiscount}
              >
                <span>Download CSV</span>
              </CSVLink>
            ) : latestReport === 'CustomerReport' ? (
              <CSVLink data={finalData || []} style={{ color: '#2F2E2E' }} filename={csvFileName} headers={csvHeaders}>
                <span>Download CSV</span>
              </CSVLink>
            ) : latestReport === 'SeedWareHouseReport' ? (
              <CSVLink data={finalData || []} style={{ color: '#2F2E2E' }} filename={csvFileName}>
                <span>Download CSV</span>
              </CSVLink>
            ) : (
              <CSVLink
                data={finalData || []}
                style={{ color: '#2F2E2E' }}
                filename={csvFileName}
                headers={filterHeader}
              >
                <span>Download CSV</span>
              </CSVLink>
            )}
          </Button> */}

          <Button
            id="customerDot"
            className={`${classes.iconButton} hide-print`}
            variant="contained"
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
              {/* <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.print();
                  }}
                >
                  Print
                </MenuItem> */}
              <MenuItem className={classes.addNewMenuItem} id="downloadCsv">
                {latestReport === 'DiscountReport' ? (
                  <CSVLink
                    data={sortBy(discountFilterList, (o) => o && o.CustomerName) || []}
                    style={{ color: '#2F2E2E' }}
                    filename={`discountReport-${organizationId}.csv`}
                    headers={csvHeadersDiscount}
                  >
                    <span>Download CSV</span>
                  </CSVLink>
                ) : latestReport === 'CustomerReport' ? (
                  <CSVLink
                    data={finalData || []}
                    style={{ color: '#2F2E2E' }}
                    filename={csvFileName}
                    headers={csvHeaders}
                  >
                    <span style={{ color: 'white' }}>Download CSV</span>
                  </CSVLink>
                ) : latestReport === 'SeedWareHouseReport' ? (
                  <CSVLink data={finalData || []} style={{ color: '#2F2E2E' }} filename={csvFileName}>
                    <span style={{ color: 'white' }}>Download CSV</span>
                  </CSVLink>
                ) : (
                  <CSVLink
                    data={finalData || []}
                    style={{ color: '#2F2E2E' }}
                    filename={csvFileName}
                    headers={filterHeader}
                  >
                    <span>Download CSV</span>
                  </CSVLink>
                )}
              </MenuItem>
              <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  this.props.history.push({
                    pathname: `/app/bayer_orders_preview/report`,
                    state: { data: finalData, header: filterHeader },
                  });
                }}
              >
                Download Data (PDF)
              </MenuItem>
              {/* <MenuItem className={classes.addNewMenuItem}>Download Data (PDF)</MenuItem> */}
            </MenuList>
          </Paper>
        </Popover>
        <Card>
          <CardBody className={classes.cardBody}>
            <ReactTable
              data={finalData}
              columns={finalHeader}
              minRows={1}
              // pageSize={finalData && finalData.length >= 50 ? 50 : finalData.length}
            />
          </CardBody>
        </Card>
      </div>
    );
  }
}
export default withStyles(customersStyles)(csvPreview);
