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

import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

import Popover from '@material-ui/core/Popover';

import MenuList from '@material-ui/core/MenuList';
import { CSVLink } from 'react-csv';
import axios from 'axios';

import { growerOrderReportStyles } from './growerOrderReportstyles';
import SweetAlert from 'react-bootstrap-sweetalert';

const typesMap = {
  B: 'SOYBEAN',
  C: 'CORN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
  P: 'PACKAGING',
};

const cropTypesMonsanto = ['C', 'B', 'S', 'L', 'P'];

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
class GrowerOrderReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allCustomerData: [],
      growerName: [],
      replant: ['All', 'true', 'false'],
      moreFuncMenuOpen: false,
      growerField: [],
      csvData: [],
      selectedCompaines: [],
      allComapines: [],
      isLoading: true,
    };
  }
  handleMoreFuncMenuClose = (event) => {
    this.setState({ moreFuncMenuOpen: false });
  };
  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };
  componentDidMount = async () => {
    await this.props.listDeliveryReceipts();
    await this.exportCsveReport();
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 5000);
  };
  handleChange = async (event, name, reportName) => {
    const { replant, csvData } = this.state;
    let data = [];
    const {
      target: { value, checked },
    } = event;

    // for acompare actual data lenght and when click on All set All data
    if (name === 'growerName') {
      await this.state.allCustomerData.map((ac) => data.push(ac.name));
    } else if (name == 'growerField') {
      csvData.length > 0 &&
        Object.keys(csvData[0]).map((s) => {
          data.push(s);
        });
    } else if (name == 'selectedCompaines') {
      await this.state.allComapines.map((ac) => data.push(ac));
    } else {
      data.push('true', 'false');
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
  };

  exportCsveReport = async () => {
    const { seedCompanies, deliveryReceipts, apiSeedCompanies, companies } = this.props;

    let tableData = [];
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data) {
          const customers = response.data.customersdata;
          this.setState({ allCustomerData: customers });
          let growerdata = [];

          await uniqBy(this.state.allCustomerData, 'name').map((c) => growerdata.push(c.name));

          this.setState({
            growerName: uniq(growerdata.concat('All')) || [],
          });
          // regular company customers product
          customers
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter((item) => item.PurchaseOrders.length > 0)
            .forEach((item) => {
              {
                return item.PurchaseOrders.filter((po) => po.isQuote == false && po.isDeleted == false).forEach(
                  (purchaseOrder) => {
                    purchaseOrder.CustomerCustomProducts.filter((item) => item.isDeleted == false)
                      .sort((a, b) => a.CustomProduct.name.localeCompare(b.CustomProduct.name))
                      .forEach((customOrder) => {
                        const deliveredData = [];
                        deliveryReceipts &&
                          deliveryReceipts
                            .filter((d) => d.isReturn == false && d.PurchaseOrderId === customOrder.PurchaseOrderId)
                            .map((dd) =>
                              dd.DeliveryReceiptDetails.filter(
                                (drd) => drd.customerMonsantoProductId == customOrder.id,
                              ).map((p) => deliveredData.push(p.amountDelivered)),
                            );
                        const returnData = [];
                        deliveryReceipts &&
                          deliveryReceipts
                            .filter((d) => d.isReturn == true && d.PurchaseOrderId === customOrder.PurchaseOrderId)
                            .map((dd) =>
                              dd.DeliveryReceiptDetails.filter(
                                (drd) => drd.customerMonsantoProductId == customOrder.id,
                              ).map((p) => deliveredData.push(p.amountDelivered)),
                            );
                        const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);

                        const returnAmount = returnData.reduce((partialSum, a) => partialSum + a, 0);

                        const remainQty = parseFloat(customOrder.orderQty) + returnAmount - parseFloat(deliveredAmount);

                        const customProductDetail = `${
                          customOrder.CustomProduct.name
                        } ${customOrder.CustomProduct.description.replace(/"/g, '')} UN-${parseFloat(
                          customOrder.CustomProduct.costUnit,
                        )}`;

                        tableData.push({
                          CustomerName: `${item.name}`,
                          PurchaseOrderId: `#PO${purchaseOrder.id}`,
                          ProductDetail: customProductDetail.replace(/"(^\&)|-,/g, '_'),
                          OrderQty: parseFloat(customOrder.orderQty),
                          QtyDelivered: parseFloat(deliveredAmount || 0).toFixed(2),
                          QtyReturned: parseFloat(returnAmount || 0).toFixed(2),
                          QtyRemaining: (parseFloat(remainQty || 0) || 0).toFixed(2),
                          productType: customOrder.CustomProduct.Company.name || '---',
                          PurchaseOrderName: purchaseOrder.name,
                          POReplant: String(purchaseOrder.isReplant),
                        });
                      });

                    // seed company customer product

                    purchaseOrder.CustomerProducts.filter((item) => item.isDeleted == false)
                      .sort((a, b) => a.Product.brand.localeCompare(b.Product.brand))
                      .forEach((customerOrder) => {
                        const deliveredData = [];
                        deliveryReceipts &&
                          deliveryReceipts
                            .filter((d) => d.PurchaseOrderId === customerOrder.PurchaseOrderId)
                            .map((dd) =>
                              dd.DeliveryReceiptDetails.filter(
                                (drd) => drd.customerMonsantoProductId === customerOrder.id,
                              ).map((p) => deliveredData.push(p.amountDelivered)),
                            );
                        const returnData = [];
                        deliveryReceipts &&
                          deliveryReceipts
                            .filter((d) => d.isReturn == true && d.PurchaseOrderId === customerOrder.PurchaseOrderId)
                            .map((dd) =>
                              dd.DeliveryReceiptDetails.filter(
                                (drd) => drd.customerMonsantoProductId == customerOrder.id,
                              ).map((p) => returnData.push(p.amountDelivered)),
                            );
                        const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);
                        const returnAmount = returnData.reduce((partialSum, a) => partialSum + a, 0);

                        const remainQty =
                          parseFloat(customerOrder.orderQty) + returnAmount - parseFloat(deliveredAmount);

                        const seedCompany = seedCompanies.find((sc) => sc.id == customerOrder.Product.seedCompanyId);

                        const customerProductDetail = `${customerOrder.Product.brand} ${customerOrder.Product.blend} ${customerOrder.Product.treatment} `;
                        const name = `${customerOrder.Product.SeedCompany.name} - ${customerOrder.Product.seedType}`;

                        tableData.push({
                          CustomerName: `${item.name}`,
                          PurchaseOrderId: `#PO${purchaseOrder.id}`,
                          ProductDetail: customerProductDetail.replace(/(^\&)|,/g, '_'),
                          OrderQty: customerOrder.orderQty,
                          QtyDelivered: parseFloat(deliveredAmount || 0).toFixed(2),
                          QtyReturned: parseFloat(returnAmount || 0).toFixed(2),
                          QtyRemaining: parseFloat(remainQty || 0).toFixed(2),
                          productType: name,
                          PurchaseOrderName: purchaseOrder.name,
                          POReplant: String(purchaseOrder.isReplant),
                        });
                      });

                    // customers monsanto product
                    purchaseOrder.CustomerMonsantoProducts.filter((item) => item.isDeleted == false).forEach(
                      (order) => {
                        const deliveredData = [];
                        deliveryReceipts &&
                          deliveryReceipts
                            .filter((d) => d.isReturn == false && d.PurchaseOrderId === order.PurchaseOrderId)
                            .map((dd) =>
                              dd.DeliveryReceiptDetails.filter((drd) => drd.customerMonsantoProductId == order.id).map(
                                (p) => deliveredData.push(p.amountDelivered),
                              ),
                            );

                        const returnData = [];
                        deliveryReceipts &&
                          deliveryReceipts
                            .filter((d) => d.isReturn == true && d.PurchaseOrderId === order.PurchaseOrderId)
                            .map((dd) =>
                              dd.DeliveryReceiptDetails.filter((drd) => drd.customerMonsantoProductId == order.id).map(
                                (p) => returnData.push(p.amountDelivered),
                              ),
                            );
                        const productDetail = order.MonsantoProduct.productDetail
                          ? `${order.MonsantoProduct.productDetail} ${order.isPickLater ? '(PickLater)' : ''}`
                          : `${order.MonsantoProduct.blend} ${order.MonsantoProduct.seedSize} ${
                              order.MonsantoProduct.brand
                            } ${order.MonsantoProduct.packaging} ${order.MonsantoProduct.treatment} ${
                              order.isPickLater ? '(PickLater)' : ''
                            }`;
                        const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);
                        const returnAmount = returnData.reduce((partialSum, a) => partialSum + a, 0);
                        const remainQty = parseFloat(order.orderQty) + returnAmount - parseFloat(deliveredAmount);
                        tableData.push({
                          CustomerName: `${item.name}`,
                          PurchaseOrderId: `#PO${purchaseOrder.id}`,
                          ProductDetail: productDetail,
                          OrderQty: order.orderQty,
                          QtyDelivered: deliveredAmount || 0,
                          QtyReturned: parseFloat(returnAmount || 0).toFixed(2),
                          QtyRemaining: parseFloat(remainQty || 0).toFixed(2),
                          productType: `Bayer - ${typesMap[order.MonsantoProduct.classification].toUpperCase()}`,
                          PurchaseOrderName: purchaseOrder.name,
                          POReplant: String(purchaseOrder.isReplant),
                        });
                      },
                    );
                  },
                );
              }
            });
        }
      });
    let data = [];
    tableData.length > 0 &&
      Object.keys(tableData[0])
        .filter((s) => s !== 'POReplant')
        .map((s) => {
          data.push(s);
        });

    this.setState({ csvData: tableData, growerField: data.concat('All') });
  };

  componentDidUpdate = async () => {
    const { seedCompanies, deliveryReceipts, apiSeedCompanies, companies, apiSeedCompaniesloadingStatus } = this.props;

    if (
      (apiSeedCompanies.length > 0 || companies.length > 0 || seedCompanies.length > 0) &&
      this.state.allComapines.length == 0
    ) {
      let selectedCompaines = [];
      await new Promise((resolve, reject) => {
        apiSeedCompanies.length > 0 &&
          cropTypesMonsanto.map((cp) => {
            const cropName = typesMap[cp];
            const bayer = apiSeedCompanies[0];
            const name = `${bayer.name} - ${cropName}`;
            return selectedCompaines.push(name);
          });
        companies.length > 0 &&
          companies.map((regular) => {
            return selectedCompaines.push(regular.name);
          });
        seedCompanies.length > 0 &&
          seedCompanies.map((seed) => {
            const cropTypes = Object.keys(JSON.parse(seed.metadata));
            return cropTypes.map((ct) => {
              const name = `${seed.name} - ${ct.toUpperCase()}`;
              selectedCompaines.push(name);
            });
          });

        resolve();
      }).then(() => {
        this.exportCsveReport();

        this.setState({
          selectedCompaines: uniq(selectedCompaines).concat('All'),
          allComapines: uniq(selectedCompaines),
        });
      });
    }
  };

  render() {
    const { classes, organizationId, apiSeedCompaniesloadingStatus, seedCompanies, companies, apiSeedCompanies } =
      this.props;
    const {
      allCustomerData,
      isLoading,
      growerName,
      selectedCompaines,
      replant,
      moreFuncMenuOpen,
      growerField,
      csvData,
    } = this.state;

    if (isLoading && selectedCompaines.length == 0) {
      return <CircularProgress />;
    }

    let finalData = [];
    let finalHeader = [];
    let customerHeader = [];

    let csvHeaders = [];
    csvData.length > 0 &&
      Object.keys(csvData[0])
        .filter((s) => growerField.includes(s))
        .map((s) => {
          csvHeaders.push({
            label: s,
            key: s,
          });
          customerHeader.push({
            Header: s,
            accessor: s,
            id: s,
          });
        });

    growerField.map((g) =>
      customerHeader.filter((ad) => ad.Header.toLowerCase() === g.toLowerCase()).map((ss) => finalHeader.push(ss)),
    );
    const finalCsvData = [];

    csvData
      .filter(
        (c) =>
          selectedCompaines.includes(c.productType) &&
          growerName.includes(c.CustomerName) &&
          replant.includes(String(c.POReplant)),
      )
      .map((c) => finalCsvData.push(c));

    return (
      <div>
        <h3 className={classes.cardIconTitle}> Grower Order Report</h3>

        <Card>
          <CardBody className={classes.cardBody}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <FormControl style={{ maxWidth: '200px', minWidth: '160px', marginRight: '20px' }}>
                  <InputLabel id="demo-multiple-checkbox-label">Filter By Grower</InputLabel>
                  <Select
                    labelId="demo-multiple-checkbox-label"
                    id="filterByGrower"
                    multiple
                    value={growerName}
                    onChange={(e) => this.handleChange(e, 'growerName')}
                    input={<OutlinedInput label="Grower" />}
                    renderValue={(selected) => selected.join(', ')}
                    // MenuProps={MenuProps}
                  >
                    <MenuItem key={'All'} value={'All'} id="All">
                      <Checkbox checked={growerName.indexOf('All') > -1} />
                      <ListItemText primary={'All'} />
                    </MenuItem>

                    {uniqBy(allCustomerData, 'name').map((g) => (
                      <MenuItem key={g.name} value={g.name}>
                        <Checkbox checked={growerName.indexOf(g.name) > -1} />
                        <ListItemText primary={g.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl style={{ maxWidth: '200px', minWidth: '160px' }}>
                  <InputLabel id="demo-multiple-checkbox-label">Filter By Replant</InputLabel>
                  <Select
                    labelId="demo-multiple-checkbox-label"
                    id="filterByReplant"
                    multiple
                    value={replant}
                    onChange={(e) => this.handleChange(e, 'replant')}
                    input={<OutlinedInput label="replant" />}
                    renderValue={(selected) => selected.join(', ')}
                    // MenuProps={MenuProps}
                  >
                    <MenuItem key={'All'} value={'All'} id="All">
                      <Checkbox checked={replant.includes('All') ? true : false} />
                      <ListItemText primary={'All'} />
                    </MenuItem>

                    <MenuItem key={'true'} value={'true'}>
                      <Checkbox checked={replant.includes('true') ? true : false} />
                      <ListItemText primary={'True'} />
                    </MenuItem>
                    <MenuItem key={'false'} value={'false'}>
                      <Checkbox checked={replant.includes('false') ? true : false} />
                      <ListItemText primary={'False'} />
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl style={{ maxWidth: '200px', minWidth: '160px', marginLeft: '20px' }}>
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
                    {customerHeader.length > 0 && (
                      <MenuItem key={'All'} value={'All'}>
                        <Checkbox checked={growerField.indexOf('All') > -1} />
                        <ListItemText primary={'All'} />
                      </MenuItem>
                    )}
                    {customerHeader.length > 0 &&
                      csvData.length > 0 &&
                      Object.keys(csvData[0]).map((name) => (
                        <MenuItem key={name} value={name}>
                          <Checkbox checked={growerField.indexOf(name) > -1} />
                          <ListItemText primary={name} />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl style={{ maxWidth: '200px', minWidth: '160px', marginLeft: '20px' }}>
                  <InputLabel id="demo-multiple-checkbox-label">Filter By Companies</InputLabel>

                  <Select
                    labelId="demo-multiple-checkbox-label"
                    multiple
                    id="selectCompaines"
                    value={selectedCompaines}
                    onChange={(e) => this.handleChange(e, 'selectedCompaines')}
                    input={<OutlinedInput label="Discount" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    <MenuItem value="All" key="All" id="All">
                      <Checkbox checked={selectedCompaines.includes('All') ? true : false} />
                      <ListItemText primary={'All'} />
                    </MenuItem>
                    {apiSeedCompanies.length > 0 &&
                      cropTypesMonsanto.map((cp) => {
                        const cropName = typesMap[cp];
                        const bayer = apiSeedCompanies[0];
                        const name = `${bayer.name} - ${cropName}`;

                        return (
                          <MenuItem value={name} key={name} id="bayer">
                            <Checkbox checked={selectedCompaines.indexOf(name) > -1} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        );
                      })}
                    {companies.length > 0 &&
                      companies.map((regular) => {
                        return (
                          <MenuItem value={regular.name} key={regular.id} id={`regular-${regular.id}`}>
                            <Checkbox checked={selectedCompaines.includes(regular.name) ? true : false} />
                            <ListItemText primary={regular.name} />
                          </MenuItem>
                        );
                      })}
                    {seedCompanies.length > 0 &&
                      seedCompanies.map((seed) => {
                        const cropTypes = Object.keys(JSON.parse(seed.metadata));
                        return cropTypes.map((ct) => {
                          const name = `${seed.name} - ${ct.toUpperCase()}`;

                          return (
                            <MenuItem value={name} key={seed.id} id={`seed-${seed.id}`}>
                              <Checkbox checked={selectedCompaines.includes(name) ? true : false} />
                              <ListItemText primary={name} />
                            </MenuItem>
                          );
                        });
                      })}
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
            <div id="growerOrderReport">
              {allCustomerData.length > 0 ? (
                <ReactTable
                  data={finalCsvData}
                  columns={finalHeader}
                  minRows={1}
                  showPagination={false}
                  LoadingComponent={Loading}
                  loading={true}
                  pageSize={500}
                />
              ) : (
                <p className={classes.noFoundMsg}>No rows Found</p>
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
                  data={finalCsvData || []}
                  style={{ color: '#2F2E2E', width: '170px' }}
                  filename={'growerOrderReport.csv'}
                  headers={csvHeaders}
                >
                  <span>Download CSV</span>
                </CSVLink>
              </MenuItem>
            </MenuList>
            <MenuList>
              <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  this.props.history.push({
                    pathname: `/app/bayer_orders_preview/growerOrderReport`,
                    state: { data: finalCsvData, header: finalHeader },
                  });
                }}
                id="dataPDF"
              >
                Download Data (PDF)
              </MenuItem>
            </MenuList>
          </Paper>
        </Popover>
        {/* {finalData.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            buttonRef={(node) => {
              this.addNewAnchorEl = node;
            }}
            id="downloadCsv"
          >
            <CSVLink
              data={csvData || []}
              style={{ color: '#2F2E2E' }}
              filename={'growerOrderReport.csv'}
              // headers={filterHeader}
            >
              <span style={{ color: 'white' }}>Download CSV</span>
            </CSVLink>
          </Button>
        )} */}
      </div>
    );
  }
}

export default withStyles(growerOrderReportStyles)(GrowerOrderReport);
