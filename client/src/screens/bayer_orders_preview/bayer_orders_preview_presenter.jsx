import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactTable from 'react-table';
import agriDealerGreenImage from '../../assets/img/agridealer-all-green.png';

import { bayer_orders_preview_Styles } from './bayer_orders_preview_styles';
import { getProductName } from '../../utilities/product.v2';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Print from '@material-ui/icons/Print';
import Button from '../../components/material-dashboard/CustomButtons/Button';
// import CustomEarlyPayTable from '../../invoice/custom_early_pay_table';
import PrintHelper from './print_helper';
import CheckBox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import InputLabel from '@material-ui/core/InputLabel';

import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';

import { sortBy, uniqBy, uniq } from 'lodash';
import OutlinedInput from '@material-ui/core/OutlinedInput';

import Checkbox from '@material-ui/core/Checkbox';
const typesMap = {
  B: 'SOYBEAN',
  C: 'CORN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
  P: 'PACKAGING',
};

const cropTypesMonsanto = ['C', 'B', 'S', 'L', 'P'];

class BayerOrdersPreviewPresenter extends Component {
  state = {
    printHelperUpdateFlag: new Date(),
    selectedFontSize: '',
    isLoading: true,
    customersData: [],
    selectedCompaines: [],
    allComapines: [],

    seedCompanyId: this.props.match.params.seedcompany_id == undefined ? 'all' : this.props.match.params.seedcompany_id,
  };
  componentDidMount = async () => {
    await this.props.listDeliveryReceipts();
    this.setState({ isLoading: true });

    await axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data) {
          const cust = response.data.customersdata;
          await axios
            .get(`${process.env.REACT_APP_API_BASE}/seed_companies`, {
              headers: { 'x-access-token': localStorage.getItem('authToken') },
            })
            .then((res) => {
              axios
                .get(`${process.env.REACT_APP_API_BASE}/companies`, {
                  headers: { 'x-access-token': localStorage.getItem('authToken') },
                })
                .then((res) => {
                  // this.setState({ isLoading: false });
                });
            });
          this.setState({
            customersData: cust,
          });
        }
      });
  };

  componentDidUpdate() {
    const { seedCompanies, deliveryReceipts, apiSeedCompanies, companies, apiSeedCompaniesloadingStatus } = this.props;

    if (
      apiSeedCompanies.length > 0 &&
      (companies.length > 0 || seedCompanies.length > 0) &&
      this.state.allComapines.length == 0
    ) {
      let selectedCompaines = [];
      new Promise((resolve, reject) => {
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
        // this.exportCsveReport();

        this.setState({
          selectedCompaines: uniq(selectedCompaines).concat('All'),
          allComapines: uniq(selectedCompaines),
          isLoading: false,
        });
      });
    }
  }

  setselectedFontSize = (e) => {
    const selectedFontSize = e.target.value;
    this.setState({ selectedFontSize });
  };

  print = async () => {
    this.setState({ isPrinting: true });
    //const { purchaseOrder, customer } = this.props;

    setTimeout(() => {
      const tempTitle = document.title;
      document.title = this.state.seedCompanyId;
      window.print();
      document.title = tempTitle;
      this.setState({ isPrinting: false });
    }, 500);
  };

  titleCase = (str) => {
    var splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  };

  customerHeader = [
    {
      Header: 'Name',
      accessor: 'name',
      id: 'name',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'PurchaseOrderName',
      id: 'purchase_orders_name',
      accessor: 'purchase_orders_name',
      Cell: (props) => {
        const purchaseOrders = props.value;

        const needsPurchaseOrder = purchaseOrders ? purchaseOrders.length : 0;
        return (
          <div>
            {needsPurchaseOrder === 0
              ? '-'
              : purchaseOrders.map((p) => {
                  return <p>{p.name}</p>;
                })}
          </div>
        );
      },
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'PurchaseOrderId',
      id: 'purchase_orders_id',
      accessor: 'purchase_orders_id',
      Cell: (props) => {
        const purchaseOrders = props.value;

        const needsPurchaseOrder = purchaseOrders ? purchaseOrders.length : 0;
        return (
          <div>
            {needsPurchaseOrder === 0
              ? '-'
              : purchaseOrders.map((p) => {
                  return <p>#{p.id}</p>;
                })}
          </div>
        );
      },
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'ProductDetails',
      id: 'product_details',
      accessor: 'product_details',
      width: 330,
      Cell: (props) => {
        const { classes } = this.props;
        const productDetail = props.value;
        return (
          <div>
            {productDetail.length === 0
              ? '-'
              : productDetail.map((d) => {
                  return <p>{d}</p>;
                })}
          </div>
        );
      },
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'OrderQty',
      id: 'order_qty',
      accessor: 'order_qty',
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
      Cell: (props) => {
        const orderQty = props.value;

        return (
          <div>
            {orderQty.length === 0
              ? '-'
              : orderQty.map((d) => {
                  return <p>{parseFloat(d.qty).toFixed(2)}</p>;
                })}
          </div>
        );
      },
    },
    {
      Header: 'Qty Delivered',

      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },

      id: 'quantityDelivered',
      accessor: 'quantityDelivered',
      Cell: (props) => {
        const allLotsDelivered = props.value;

        return (
          <div>
            {allLotsDelivered.map((s) => {
              return <p>{parseFloat(s.delivred).toFixed(2)}</p>;
            })}
          </div>
        );
      },
    },
    {
      Header: 'RemainingQty',
      id: 'remain_qty',
      accessor: 'remain_qty',
      Cell: (props) => {
        const { classes } = this.props;

        const remainOty = props.value;

        return (
          <div>
            {remainOty.length === 0
              ? '-'
              : remainOty.map((d) => {
                  return <p>{d.remainQty.toFixed(2)}</p>;
                })}
          </div>
        );
      },
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'POReplant',
      id: 'isReplant',
      accessor: 'isReplant',
      Cell: (props) => {
        const Replant = props.value;

        return <div>{Replant.length === 0 ? '-' : Replant.map((p) => <p>{p}</p>)}</div>;
      },
      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
        textAlign: 'left',
      },
    },
  ];

  getTableData = (purchaseOrder) => {
    const { seedCompanyId } = this.state;
    const { seedCompanies, deliveryReceipts, location } = this.props;
    let tableData = [];
    if (
      seedCompanyId === 'InventoryReport' ||
      seedCompanyId === 'discountReport' ||
      seedCompanyId == 'seedWareHouseReport' ||
      seedCompanyId == 'profileReport'
    ) {
      tableData = location.state || [];
    } else {
      tableData = location.state !== undefined ? location.state.data : [] || [];
    }
    return { tableData };
  };

  tableHeadersAllSeed = [
    {
      Header: '',
      id: 'checkbox',
      width: 100,
      accessor: (d) => d,
      Cell: (props) => {
        return <div>{props.value.checkbox}</div>;
      },
    },
    {
      Header: 'Product Detail',
      id: 'productDetail',
      headerStyle: {
        textAlign: 'center',
      },
      accessor: (d) => d,
      Cell: (props) => {
        return <div style={{ textAlign: 'left' }}>{props.value.productDetail}</div>;
      },
    },
    {
      Header: 'Order Qty',
      id: 'orderQty',
      headerStyle: {
        textAlign: 'center',
      },
      accessor: (d) => d,
      Cell: (props) => {
        return <div style={{ textAlign: 'center' }}>{props.value.orderQty}</div>;
      },
    },
    {
      Header: 'Qty Delivered',
      id: 'qtyDelivered',
      headerStyle: {
        textAlign: 'center',
      },
      accessor: (d) => d,
      Cell: (props) => {
        return <div style={{ textAlign: 'center' }}>{props.value.qtyDelivered}</div>;
      },
    },
    {
      Header: 'Qty Remaining',
      id: 'qtyRemaining',
      headerStyle: {
        textAlign: 'center',
      },
      accessor: (d) => d,
      Cell: (props) => {
        return <div style={{ textAlign: 'center' }}>{props.value.qtyRemaining}</div>;
      },
    },
  ];
  getSeedTableData = (purchaseOrder) => {
    // const productType = this.props.match.params.product_type;
    const { seedCompanyId } = this.state;
    const { seedCompanies, deliveryReceipts } = this.props;

    let tableData = [];
    let tableDataNonBayer = [];
    let tableHeaders = [
      {
        Header: '',
        id: 'checkbox',
        width: 100,
        accessor: (d) => d,
        Cell: (props) => {
          return <div>{props.value.checkbox}</div>;
        },
      },
      {
        Header: 'Product Detail',
        id: 'productDetail',
        headerStyle: {
          textAlign: 'center',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return <div style={{ textAlign: 'left' }}>{props.value.productDetail}</div>;
        },
      },
      {
        Header: 'Order Qty',
        id: 'orderQty',
        headerStyle: {
          textAlign: 'center',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return <div style={{ textAlign: 'center' }}>{props.value.orderQty}</div>;
        },
      },
      {
        Header: 'Qty Delivered',
        id: 'qtyDelivered',
        headerStyle: {
          textAlign: 'center',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return <div style={{ textAlign: 'center' }}>{props.value.qtyDelivered}</div>;
        },
      },
      {
        Header: 'Qty Returned',
        id: 'qtyReturned',
        headerStyle: {
          textAlign: 'center',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return <div style={{ textAlign: 'center' }}>{props.value.qtyReturned}</div>;
        },
      },

      {
        Header: 'Qty Remaining',
        id: 'qtyRemaining',
        headerStyle: {
          textAlign: 'center',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return <div style={{ textAlign: 'center' }}>{props.value.qtyRemaining}</div>;
        },
      },
    ];

    // regular company customers product
    if (seedCompanyId == 'all') {
      purchaseOrder.CustomerCustomProducts.filter((item) => item.orderQty > 0 && item.isDeleted == false)
        .sort((a, b) => a.CustomProduct.name.localeCompare(b.CustomProduct.name))
        .forEach((customOrder) => {
          const deliveredData = [];
          deliveryReceipts &&
            deliveryReceipts
              .filter((d) => d.isReturn == false && d.PurchaseOrderId === customOrder.PurchaseOrderId)
              .map((dd) =>
                dd.DeliveryReceiptDetails.filter((drd) => drd.customerMonsantoProductId == customOrder.id).map((p) =>
                  deliveredData.push(p.amountDelivered),
                ),
              );
          const returnData = [];
          deliveryReceipts &&
            deliveryReceipts
              .filter((d) => d.isReturn == true && d.PurchaseOrderId === customOrder.PurchaseOrderId)
              .map((dd) =>
                dd.DeliveryReceiptDetails.filter((drd) => drd.customerMonsantoProductId == customOrder.id).map((p) =>
                  deliveredData.push(p.amountDelivered),
                ),
              );
          const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);

          const returnAmount = returnData.reduce((partialSum, a) => partialSum + a, 0);
          const customProductDetail = `${customOrder.CustomProduct.name} ${customOrder.CustomProduct.description} ${customOrder.CustomProduct.costUnit}`;

          const remainQty = parseFloat(customOrder.orderQty) + returnAmount - parseFloat(deliveredAmount);

          tableDataNonBayer.push({
            productDetail: customProductDetail,
            orderQty: parseFloat(customOrder.orderQty).toFixed(2),
            checkbox: (
              <div>
                <CheckBox />
              </div>
            ),
            QtyReturned: parseFloat(returnAmount || 0).toFixed(2),

            qtyDelivered: deliveredAmount.toFixed(2) || 0,
            qtyRemaining: (parseFloat(remainQty || 0) || 0).toFixed(2),
            companyName: customOrder.CustomProduct.Company.name,
          });
        });

      // seed company customer product

      purchaseOrder.CustomerProducts.filter((item) => item.orderQty > 0 && item.isDeleted == false)
        .sort((a, b) => a.Product.brand.localeCompare(b.Product.brand))
        .forEach((customerOrder) => {
          const deliveredData = [];
          deliveryReceipts &&
            deliveryReceipts
              .filter((d) => d.PurchaseOrderId === customerOrder.PurchaseOrderId)
              .map((dd) =>
                dd.DeliveryReceiptDetails.filter((drd) => drd.customerMonsantoProductId === customerOrder.id).map((p) =>
                  deliveredData.push(p.amountDelivered),
                ),
              );
          const returnData = [];
          deliveryReceipts &&
            deliveryReceipts
              .filter((d) => d.isReturn == true && d.PurchaseOrderId === customerOrder.PurchaseOrderId)
              .map((dd) =>
                dd.DeliveryReceiptDetails.filter((drd) => drd.customerMonsantoProductId == customerOrder.id).map((p) =>
                  returnData.push(p.amountDelivered),
                ),
              );
          const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);
          const returnAmount = returnData.reduce((partialSum, a) => partialSum + a, 0);

          const remainQty = parseFloat(customerOrder.orderQty) + returnAmount - parseFloat(deliveredAmount);

          const seedCompany = seedCompanies.find((sc) => sc.id == customerOrder.Product.seedCompanyId);
          let productSeedType = customerOrder.Product.seedType
            ? this.titleCase(customerOrder.Product.seedType.toLowerCase())
            : '';
          const metadata = seedCompany && JSON.parse(seedCompany.metadata);

          const seedtype = metadata[productSeedType] ? metadata[productSeedType].brandName : '';
          const productFirstLine = `${seedtype} ${seedCompany.name}`;
          const customerProductDetail = `${customerOrder.Product.brand} ${customerOrder.Product.blend} ${customerOrder.Product.treatment} `;
          tableDataNonBayer.push({
            productDetail: (
              <div>
                {productFirstLine}
                <br />
                {customerProductDetail}
              </div>
            ),
            orderQty: parseFloat(customerOrder.orderQty),
            checkbox: <CheckBox />,
            qtyDelivered: deliveredAmount.toFixed(2) || 0,
            qtyReturned: parseFloat(returnAmount || 0).toFixed(2),
            qtyRemaining: parseFloat(remainQty || 0).toFixed(2),
            companyName: `${seedCompany.name} - ${customerOrder.Product.seedType}`,
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

      const deliveredData = [];
      deliveryReceipts &&
        deliveryReceipts
          .filter((d) => d.isReturn == false && d.PurchaseOrderId === order.PurchaseOrderId)
          .map((dd) =>
            dd.DeliveryReceiptDetails.filter((drd) => drd.customerMonsantoProductId == order.id).map((p) =>
              deliveredData.push(p.amountDelivered),
            ),
          );

      const returnData = [];
      deliveryReceipts &&
        deliveryReceipts
          .filter((d) => d.isReturn == true && d.PurchaseOrderId === order.PurchaseOrderId)
          .map((dd) =>
            dd.DeliveryReceiptDetails.filter((drd) => drd.customerMonsantoProductId == order.id).map((p) =>
              returnData.push(p.amountDelivered),
            ),
          );
      // if (MONSANTO_SEED_TYPES[order.MonsantoProduct.classification] !== productType.toUpperCase()) return;
      const productDetail = order.MonsantoProduct.productDetail
        ? order.MonsantoProduct.productDetail
        : `${order.MonsantoProduct.blend} ${order.MonsantoProduct.seedSize} ${order.MonsantoProduct.brand} ${order.MonsantoProduct.packaging} ${order.MonsantoProduct.treatment}`;
      const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);
      const returnAmount = returnData.reduce((partialSum, a) => partialSum + a, 0);
      const remainQty = parseFloat(order.orderQty) + returnAmount - parseFloat(deliveredAmount);
      tableData.push({
        productDetail,
        orderQty: parseFloat(order.orderQty).toFixed(2),
        checkbox: <CheckBox />,
        qtyDelivered: deliveredAmount.toFixed(2) || 0,
        qtyReturned: parseFloat(returnAmount || 0).toFixed(2),
        qtyRemaining: parseFloat(remainQty || 0).toFixed(2),
        companyName: `Bayer - ${typesMap[order.MonsantoProduct.classification]}`,
      });
    });

    return { tableData, tableDataNonBayer, tableHeaders };
  };
  handleChange = async (event, name, reportName) => {
    const { replant, csvData } = this.state;
    let data = [];
    const {
      target: { value, checked },
    } = event;

    await this.state.allComapines.map((ac) => data.push(ac));

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
  render() {
    const { customers, classes, match, location, seedCompanies, companies, apiSeedCompanies } = this.props;
    const { customersData, seedCompanyId, selectedCompaines } = this.state;
    if (this.state.isLoading) {
      return <CircularProgress />;
    }
    let tableHeader = [];
    const { tableData } = this.getTableData();

    if (seedCompanyId === 'customerReport') {
      tableHeader = location.state !== undefined ? location.state.header : [];
    } else if (seedCompanyId === 'growerOrderReport') {
      tableHeader = location.state !== undefined ? location.state.header : [];
    } else if (seedCompanyId == 'report') {
      location.state !== undefined &&
        location.state.header.map((s) => {
          tableHeader.push({
            Header: s.label,
            accessor: s.label,
            id: s.label,

            headerStyle: {
              fontSize: '15px',
              fontWeight: 'bold',
              textTransform: 'capitalize',
              textAlign: 'left',
            },
          });
        });
    } else if (seedCompanyId == 'dealerReceiveReturn') {
      location.state !== undefined &&
        location.state.header.map((s) => {
          tableHeader.push({
            Header: s,
            accessor: s,
            id: s,
            headerStyle: {
              fontSize: '15px',
              fontWeight: 'bold',
              textTransform: 'capitalize',
              textAlign: 'left',
            },
          });
        });
    } else if (seedCompanyId == 'all') {
      tableHeader = this.tableHeadersAllSeed;
    } else {
      tableData !== undefined &&
        tableData.length > 0 &&
        Object.keys(tableData[0]).map((s) => {
          s !== 'CompanyId' &&
            tableHeader.push({
              Header: s,
              accessor: s,

              headerStyle: {
                fontSize: '15px',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                textAlign: 'left',
              },
            });
        });
    }

    return (
      <div id="bayer-order-preview">
        <div key={this.state.printHelperUpdateFlag}>
          <PrintHelper />
        </div>
        <Button className={`${classes.printButton} hide-print`} onClick={this.print} color="info">
          <Print />
        </Button>
        {/* <Button className={`${classes.mailButton} hide-print`} onClick={this.handleClickOpen} color="info">
          <MailOutlineIcon />
        </Button> */}

        {/* <Select
          displayEmpty
          className={'hide-print'}
          style={{ position: 'absolute', left: 30, top: 100 }}
          value={this.state.selectedFontSize || ''}
          onChange={this.setselectedFontSize}
        >
          <MenuItem value={''}>Select FontSize</MenuItem>
          <MenuItem value={'0.8rem'}>0.8 rem</MenuItem>
          <MenuItem value={'0.9rem'}>0.9 rem</MenuItem>
      </Select>*/}

        {seedCompanyId == 'all' && (
          <FormControl
            style={{ maxWidth: '200px', minWidth: '160px', marginLeft: '40px', marginTop: '-10px' }}
            className="hide-print"
          >
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
        )}
        <div className={classes.printContainer} style={{ marginTop: '40px' }}>
          <div className={classes.content_logo}>
            <h5 style={{ width: '100%', height: '15px' }}>
              {' '}
              {seedCompanyId == 'all' ? 'Seed WareHouse Report' : seedCompanyId}
            </h5>
            <img className={`${classes.logo_green} hide-print`} src={agriDealerGreenImage} />
          </div>
          <div className={classes.content}>
            {/* <DeliveryListPreviewHeader organization={organization} purchaseOrder={purchaseOrder} /> */}
            <div>
              {seedCompanyId == 'all' &&
                customersData
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .filter((item) => item.PurchaseOrders.length > 0)
                  .map((item) => {
                    return item.PurchaseOrders.filter((po) => po.isQuote == false && po.isDeleted == false).map(
                      (purchaseOrder) => {
                        const { tableData, tableHeaders, tableDataNonBayer } = this.getSeedTableData(purchaseOrder);

                        return tableData.length > 0 || tableDataNonBayer.length > 0 ? (
                          <div style={{ fontSize: this.state.selectedFontSize, marginTop: '50px' }}>
                            <div>
                              {/* <div className={classes.delivery_list_note}>{item.name || ''}</div> */}
                              <div className={classes.purchase_order_header}>
                                {`${item.name || ''} PO#${purchaseOrder.id}  `}
                                {purchaseOrder.name ? `( ${purchaseOrder.name} )  ` : ''}
                                {`Created At : ${moment.utc(purchaseOrder.createdAt).format('MM/DD/YYYY')}`}
                              </div>

                              <div className="invoice-table-wrapper">
                                {tableData.filter((t) => selectedCompaines.includes(t.companyName)).length > 0 ? (
                                  <ReactTable
                                    sortable={false}
                                    showPagination={false}
                                    resizable={false}
                                    minRows={1}
                                    columns={tableHeaders}
                                    pageSize={500}
                                    data={tableData
                                      .filter((t) => selectedCompaines.includes(t.companyName))
                                      .sort((a, b) => a.productDetail.localeCompare(b.productDetail))}
                                    className={`${classes.summaryTable} no-white-space`}
                                    getTheadTrProps={() => {
                                      let style = { fontSize: this.state.selectedFontSize };
                                      style = {
                                        ...style,
                                        color: '#3C4858',
                                        background: '#CDDFC8',
                                        fontWeight: 'bold',
                                      };
                                      return { style };
                                    }}
                                    getTrProps={() => {
                                      let style = { fontSize: this.state.selectedFontSize };
                                      style = {
                                        ...style,
                                        color: 'black',
                                        // fontWeight: 'bold',
                                      };

                                      return {
                                        style,
                                      };
                                    }}
                                  />
                                ) : (
                                  ''
                                )}
                              </div>
                              <div className="invoice-table-wrapper">
                                {tableDataNonBayer.filter((t) => selectedCompaines.includes(t.companyName)).length >
                                0 ? (
                                  <ReactTable
                                    sortable={false}
                                    showPagination={false}
                                    resizable={false}
                                    minRows={1}
                                    columns={tableHeaders}
                                    pageSize={500}
                                    data={tableDataNonBayer.filter((t) => selectedCompaines.includes(t.companyName))}
                                    className={`${classes.summaryTable} no-white-space`}
                                    getTheadTrProps={() => {
                                      let style = { fontSize: this.state.selectedFontSize };
                                      style = {
                                        ...style,
                                        color: '#3C4858',
                                        background: '#CDDFC8',
                                        fontWeight: 'bold',
                                      };
                                      return { style };
                                    }}
                                    getTrProps={() => {
                                      let style = { fontSize: this.state.selectedFontSize };
                                      style = {
                                        ...style,
                                        color: 'black',
                                      };
                                      return {
                                        style,
                                      };
                                    }}
                                  />
                                ) : (
                                  ''
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          ''
                        );
                      },
                    );
                  })}

              {seedCompanyId !== 'all' && (
                <div className="invoice-table-wrapper">
                  {tableData.length > 0 ? (
                    <ReactTable
                      sortable={false}
                      showPagination={false}
                      resizable={false}
                      minRows={1}
                      pageSize={500}
                      columns={tableHeader}
                      data={tableData}
                      className={`${classes.summaryTable} no-white-space`}
                      getTheadTrProps={() => {
                        let style = { fontSize: this.state.selectedFontSize };
                        style = {
                          ...style,
                          color: '#3C4858',
                          background: '#CDDFC8',
                          fontWeight: 'bold',
                        };
                        return { style };
                      }}
                      getTrProps={() => {
                        let style = { fontSize: this.state.selectedFontSize };
                        style = {
                          ...style,
                          color: 'black',
                          // fontWeight: 'bold',
                        };

                        return {
                          style,
                        };
                      }}
                    />
                  ) : (
                    ''
                  )}
                </div>
              )}
            </div>

            {/* <div id="pageFooter">PO #${currentPurchaseOrder.id}</div> */}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(bayer_orders_preview_Styles)(BayerOrdersPreviewPresenter);
