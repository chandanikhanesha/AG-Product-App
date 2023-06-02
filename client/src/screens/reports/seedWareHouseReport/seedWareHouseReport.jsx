import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ReactTable from 'react-table';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import FormControl from '@material-ui/core/FormControl';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import CheckBox from '@material-ui/core/Checkbox';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import { flatten } from 'lodash/array';
import { sortBy } from 'lodash';
import { CSVLink } from 'react-csv';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import { uniqBy, uniq } from 'lodash';

import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

import Popover from '@material-ui/core/Popover';

import MenuList from '@material-ui/core/MenuList';

import { seedWareHouseReportStyles } from './seedWareHouseReportstyles';
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
class seedWareHouseReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCompaines: '',
      selectedCroptype: '',
      finalCompanyData: [],
      cancelConfirm: null,
      seedTableData: [],
      moreFuncMenuOpen: false,
      isLoading: false,
      selectedZoneId: [],
      seedCsvData: [],
      seedListData: [],
      isShow: false,
      growerField: [],
    };
  }

  componentDidMount = async () => {
    await this.props.listCompanies();
    await this.props.listSeedCompanies();
    // await this.props.listApiSeedCompanies();
    await this.props.listDeliveryReceipts();
    await this.props.listCustomerMonsantoProducts();
    setTimeout(() => {
      this.exportSeedWarehouseReport();
    }, 2000);
    await this.exportSeedWarehouseReport();
  };
  handeleTransferInfoChange = (name) => (event) => {
    this.setState({ [name]: event.target.value });
  };
  handleMoreFuncMenuClose = (event) => {
    this.setState({ moreFuncMenuOpen: false });
  };
  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };
  titleCase = (str) => {
    var splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  };
  exportSeedWarehouseReport = async () => {
    const { seedCompanies, deliveryReceipts, organizationId } = this.props;
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data) {
          const customers = response.data.customersdata;

          let seedCompanyId = 'all';

          let csvData = '';
          const headers = [
            'Customer',
            'Purchase Order',
            'Product Type',
            'Product Detail',
            'Order Qty',
            'Qty Delivered',
            'Qty Remaining',
          ];
          let tableData = [];
          let tableDataNonBayer = [];
          // regular company customers product
          customers
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter((item) => item.PurchaseOrders.length > 0)
            .forEach((item) => {
              {
                return item.PurchaseOrders.filter((po) => po.isQuote == false && po.isDeleted == false).forEach(
                  (purchaseOrder) => {
                    if (seedCompanyId == 'all') {
                      purchaseOrder.CustomerCustomProducts.filter(
                        (item) => item.orderQty > 0 && item.isDeleted == false,
                      )
                        .sort((a, b) => a.CustomProduct.name.localeCompare(b.CustomProduct.name))
                        .forEach((customOrder) => {
                          const deliveredData =
                            deliveryReceipts &&
                            deliveryReceipts
                              .filter((d) => d.purchaseOrderId === customOrder.purchaseOrderId)
                              .map((dd) =>
                                dd.DeliveryReceiptDetails.filter(
                                  (drd) => drd.customerMonsantoProductId === customOrder.id,
                                ).reduce((acc, detail) => acc + parseFloat(detail.amountDelivered), 0),
                              );
                          const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);

                          const customProductDetail = `${
                            customOrder.CustomProduct.name
                          } ${customOrder.CustomProduct.description.replace(/"/g, '')}-${parseFloat(
                            customOrder.CustomProduct.costUnit,
                          )}`;

                          tableData.push({
                            Customer: `${item.name}`,
                            PurchaseOrder: `#PO${purchaseOrder.id}`,
                            ProductDetail: customProductDetail.replace(/"(^\&)|-,/g, '_'),
                            OrderQty: parseFloat(customOrder.orderQty),
                            QtyDelivered: parseFloat(deliveredAmount || 0).toFixed(2),
                            QtyRemaining: (parseFloat(customOrder.orderQty) - (deliveredAmount || 0)).toFixed(2),
                            CompanyType: 'Regular',
                            CompanyId: customOrder.CustomProduct.companyId,
                          });
                        });

                      // seed company customer product

                      purchaseOrder.CustomerProducts.filter((item) => item.orderQty > 0 && item.isDeleted == false)
                        .sort((a, b) => a.Product.brand.localeCompare(b.Product.brand))
                        .forEach((customerOrder) => {
                          const deliveredData =
                            deliveryReceipts &&
                            deliveryReceipts
                              .filter((d) => d.purchaseOrderId === customerOrder.purchaseOrderId)
                              .map((dd) =>
                                dd.DeliveryReceiptDetails.filter(
                                  (drd) => drd.customerMonsantoProductId === customerOrder.id,
                                ).reduce((acc, detail) => acc + detail.amountDelivered, 0),
                              );
                          const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);
                          const seedCompany = seedCompanies.find((sc) => sc.id == customerOrder.Product.seedCompanyId);
                          let productSeedType = customerOrder.Product.seedType
                            ? this.titleCase(customerOrder.Product.seedType.toLowerCase())
                            : '';
                          // const metadata = JSON.parse(seedCompany.metadata);
                          // const seedtype = metadata[productSeedType] ? metadata[productSeedType].brandName : '';
                          // const productFirstLine = `${seedtype} ${seedCompany.name}`;

                          const customerProductDetail = `${customerOrder.Product.brand} ${customerOrder.Product.blend} ${customerOrder.Product.treatment} `;
                          tableData.push({
                            Customer: `${item.name}`,
                            PurchaseOrder: `#PO${purchaseOrder.id}`,
                            ProductDetail: customerProductDetail.replace(/(^\&)|,/g, '_'),
                            OrderQty: customerOrder.orderQty,
                            QtyDelivered: parseFloat(deliveredAmount || 0).toFixed(2),
                            QtyRemaining: (parseFloat(customerOrder.orderQty) - deliveredAmount).toFixed(2),
                            CompanyType: 'Seed',
                            CompanyId: customerOrder.Product.seedCompanyId,
                          });
                        });
                    }

                    // customers monsanto product
                    purchaseOrder.CustomerMonsantoProducts.filter(
                      (item) => item.isSent !== false && item.orderQty > 0 && item.isDeleted == false,
                    ).forEach((order) => {
                      if (seedCompanyId !== 'all') {
                        if (order.MonsantoProduct.seedCompanyId != seedCompanyId) return;
                      }

                      const deliveredData =
                        deliveryReceipts &&
                        deliveryReceipts
                          .filter((d) => d.purchaseOrderId === order.purchaseOrderId)
                          .map((dd) =>
                            dd.DeliveryReceiptDetails.filter(
                              (drd) => drd.customerMonsantoProductId === order.id,
                            ).reduce((acc, detail) => acc + parseFloat(detail.amountDelivered), 0),
                          );

                      // if (MONSANTO_SEED_TYPES[order.MonsantoProduct.classification] !== productType.toUpperCase()) return;
                      const productDetail = order.MonsantoProduct.productDetail
                        ? order.MonsantoProduct.productDetail
                        : `${order.MonsantoProduct.blend} ${order.MonsantoProduct.seedSize} ${order.MonsantoProduct.brand} ${order.MonsantoProduct.packaging} ${order.MonsantoProduct.treatment}`;
                      const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);
                      tableData.push({
                        Customer: `${item.name}`,
                        PurchaseOrder: `#PO${purchaseOrder.id}`,
                        ProductDetail: productDetail,
                        OrderQty: order.orderQty,
                        QtyDelivered: deliveredAmount || 0,
                        QtyRemaining: order.orderQty - deliveredAmount || 0,
                        CompanyType: 'Bayer',
                        CompanyId: 'Bayer',
                      });
                    });
                  },
                );
              }
            });
          csvData += headers.join(',');
          csvData += '\n';
          tableData.forEach((product) => {
            const row = [
              product.customer,
              product.purchaseOrder,
              product.type,
              product.productDetail,
              product.orderQty,
              product.qtyDelivered,
              product.qtyRemaining,
            ];
            csvData += row.join(',');
            csvData += '\n';
          });
          // downloadCSV(csvData, `seedWareHouseReport`);
          const fieldName = [];
          tableData.length > 0 &&
            Object.keys(tableData[0])
              .filter((s) => s !== 'CompanyId')
              .map((g) => fieldName.push(g));
          this.setState({
            seedCsvData: csvData,
            seedListData: tableData,
            growerField: fieldName.concat('All'),
          });
        }
      });
  };
  handleChange = async (event, name, reportName) => {
    let data = [];
    const {
      target: { value, checked },
    } = event;

    // for acompare actual data lenght and when click on All set All data

    this.state.seedListData.length > 0 &&
      Object.keys(this.state.seedListData[0])
        .filter((s) => s !== 'CompanyId')
        .map((g) => data.push(g));

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
    } else {
      if (uniq(data).length === value.length) {
        if (!value.includes('All') && value.length === this.state[name].length - 1) {
          await this.setState({
            [name]: [],
          });
        } else {
          await this.setState({
            [name]: typeof value === 'string' ? value.split(',') : value.concat('All'),
          });
        }
      } else {
        await this.setState({
          [name]: typeof value === 'string' ? value.split(',') : value,
        });
      }
    }
  };

  generateReport = async () => {
    this.setState({ seedTableData: [] });
    const { selectedCompaines, seedListData } = this.state;
    const companyType = selectedCompaines != '' && selectedCompaines.split('-')[0];

    const companyId = selectedCompaines != '' && selectedCompaines.split('-')[1];

    if (selectedCompaines === 'Bayer') {
      this.setState({
        seedTableData: seedListData.filter((t) => t.CompanyType === 'Bayer' && t.CompanyId === 'Bayer'),
      });
    } else if (companyType === 'seed') {
      this.setState({
        seedTableData: seedListData.filter((t) => t.CompanyType === 'Seed' && t.CompanyId == companyId),
      });
    } else if (companyType === 'regular') {
      this.setState({
        seedTableData: seedListData.filter((t) => t.CompanyType === 'Regular' && t.CompanyId == companyId),
      });
    }
  };

  render() {
    const {
      seedCompanies,
      companies,
      apiSeedCompanies,
      classes,
      organizationId,
      isOnline,

      monsantoRetailerOrderSummaryStatus,
    } = this.props;
    const {
      selectedCompaines,
      moreFuncMenuOpen,
      selectedCroptype,
      seedTableData,
      isLoading,
      seedCsvData,
      seedListData,
      growerField,
    } = this.state;
    let cropTypes = [];
    let tableData = [];
    let tableHeader = [];
    let reportColumn = [];

    if (isOnline && seedListData.length < 0) {
      return <CircularProgress />;
    }

    seedListData.length > 0 &&
      Object.keys(seedListData[0])
        .filter((s) => s !== 'CompanyId')
        .filter((s) => growerField.find((gf) => gf == s))
        .map((s) => {
          tableHeader.push({
            Header: s,
            accessor: s,
            headerStyle: {
              fontSize: '15px',
              fontWeight: 'bold',
              textTransform: 'capitalize',
            },
          });
        });
    seedListData.length > 0 && Object.keys(seedListData[0]).filter((s) => s !== 'CompanyId' && reportColumn.push(s));

    let csvdata = [];

    seedListData.map(async (s) => {
      let data = {};
      Object.keys(s)
        .filter((s) => s !== 'CompanyId')
        .filter((s) => growerField.find((gf) => gf == s))
        .map((d) => {
          data[d] = s[d];
        });
      return csvdata.push(data);
    });
    const companyType = selectedCompaines != '' && selectedCompaines.split('-')[0];

    return (
      <div>
        <h3 className={classes.cardIconTitle}> SeedWareHouse Report</h3>

        <Card>
          <CardBody className={classes.cardBody}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }} style={{ marginRight: '40px' }}>
                  <InputLabel id="demo-simple-select-standard-label">Select Compaines</InputLabel>
                  <Select
                    id="selectCompaines"
                    value={selectedCompaines}
                    onChange={this.handeleTransferInfoChange('selectedCompaines')}
                    autoWidth
                    inputProps={{
                      className: classes.packagingSelect,
                      required: true,
                      name: 'compaines',
                      id: 'compaines',
                    }}
                  >
                    <MenuItem value={'Bayer'} key={'Bayer'}>
                      {'Bayer'}
                    </MenuItem>

                    {companies.length > 0 &&
                      companies.map((regular) => {
                        return (
                          <MenuItem value={`regular-${regular.id}`} key={regular.id}>
                            {regular.name}
                          </MenuItem>
                        );
                      })}
                    {seedCompanies.length > 0 &&
                      seedCompanies.map((seed) => {
                        return (
                          <MenuItem value={`seed-${seed.id}`} key={seed.id}>
                            {seed.name}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>
                {seedTableData.length > 0 && (
                  <FormControl style={{ maxWidth: '200px', minWidth: '160px', marginRight: '50px' }}>
                    <InputLabel id="demo-multiple-checkbox-label">Filter By Field</InputLabel>
                    <Select
                      labelId="demo-multiple-checkbox-label"
                      id="demo-multiple-checkbox"
                      multiple
                      value={growerField}
                      onChange={(e) => this.handleChange(e, 'growerField')}
                      input={<OutlinedInput label="Discount" />}
                      renderValue={(selected) => selected.join(', ')}
                      // MenuProps={MenuProps}
                    >
                      {reportColumn.length > 0 && (
                        <MenuItem key={'All'} value={'All'}>
                          <Checkbox checked={growerField.indexOf('All') > -1} />
                          <ListItemText primary={'All'} />
                        </MenuItem>
                      )}
                      {reportColumn.length > 0 &&
                        reportColumn.map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox checked={growerField.indexOf(name) > -1} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}
                <Button
                  color="primary"
                  id="generateReport"
                  onClick={() => this.generateReport(tableData)}
                  disabled={monsantoRetailerOrderSummaryStatus === 'Loading' ? true : false}
                >
                  Generate SeedWareHouse Report
                </Button>
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

            <div id="generateTable">
              {seedTableData.length > 0 ? (
                <ReactTable
                  data={seedTableData}
                  columns={tableHeader}
                  minRows={1}
                  showPagination={false}
                  LoadingComponent={Loading}
                  loading={true}
                  pageSize={seedTableData.length}
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
              <MenuItem className={classes.addNewMenuItem}>
                <CSVLink
                  data={csvdata || []}
                  style={{ color: '#2F2E2E' }}
                  id="downloadCsv"
                  filename={`seedWareHouseReport-${companyType}.csv`}
                  // headers={filterHeader}
                >
                  <span>Download CSV</span>
                </CSVLink>
              </MenuItem>
              <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  this.props.history.push({
                    pathname: `/app/bayer_orders_preview/seedWareHouseReport`,
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

export default withStyles(seedWareHouseReportStyles)(seedWareHouseReport);
