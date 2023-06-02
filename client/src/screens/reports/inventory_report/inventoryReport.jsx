import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ReactTable from 'react-table';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '../../../components/material-dashboard/CustomButtons/Button';

import { flatten } from 'lodash/array';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';

import { sortBy } from 'lodash';
import { CSVLink } from 'react-csv';
import Paper from '@material-ui/core/Paper';
import { numberToDollars } from '../../../utilities';
import { uniqBy, uniq } from 'lodash';

import axios from 'axios';

import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

import Popover from '@material-ui/core/Popover';

import MenuList from '@material-ui/core/MenuList';
import { getWareHouseValue, getDeliveryLotsQty, getDeliveryLotsQtyReturn } from '../../../utilities/product';
import {
  getQtyOrdered,
  getQtyShipped,
  getGrowerOrder,
  getGrowerOrderDelivered,
  getTransferInAmount,
  getTransferOutAmount,
  getCustomerProducts,
} from '../../../utilities/product';

import { inventoryReportStyles } from './inventory_reportstyles';
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
class InventoryReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCompaines: '',
      selectedCroptype: '',
      finalCompanyData: [],
      cancelConfirm: null,
      inventoryListData: [],
      moreFuncMenuOpen: false,
      isLoading: false,
      selectedZoneId: [],
      growerField: [],
      packagingData: [],
    };
  }

  componentDidMount = async () => {
    await this.props.listCompanies();
    await this.props.listSeedCompanies();
    await this.props.listApiSeedCompanies();
    await this.props.listDeliveryReceipts();
    await this.props.listCustomerMonsantoProducts();
    axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data) {
          localStorage.setItem('AllCustomersData', JSON.stringify(response.data));
        }
      });
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/products/packaging_products`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        const data = response.data.items;
        this.setState({ packagingData: data });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  handeleTransferInfoChange = (name) => (event) => {
    const { seedCompanies, companies, apiSeedCompanies } = this.props;
    const { selectedCompaines } = this.state;

    this.setState({ [name]: event.target.value });
  };
  handleMoreFuncMenuClose = (event) => {
    this.setState({ moreFuncMenuOpen: false });
  };
  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };
  fetchRetailerOrderSummary = async (cropType, seedCompanyId) => {
    await this.props.fetchZoneIds(cropType).then(() => {
      this.setState({ selectedZoneId: this.props.zoneIds[0] });
    });
    await this.props
      .listRetailerOrderSummary({
        cropType,
        seedCompanyId,
        zoneIds: this.props.zoneIds[0] || this.state.selectedZoneId,
      })
      .then((res) => {
        setTimeout(() => {
          this.props.monsantoRetailerOrderSummaryStatus === 'Loaded' &&
            this.exportCsvBayer(this.props.monsantoRetailerOrderSummaryProducts);
        }, 800);
      });
  };
  exportCsvBayer = async (data) => {
    let tabledata = [];

    await data.forEach((product) => {
      let rm;
      const { blend } = product.Product;
      let match = blend && blend.match(/DKC[0-9]*-/);
      if (match) {
        let i = match[0].replace('DKC', '').replace('-', '');
        rm = parseInt(i, 0) + 50;
      } else {
        rm = '-';
      }
      const { suggestedDealerPrice, suggestedEndUserPrice } = product.Product.LineItem || {};
      const { zoneIds, selectedZoneId } = this.props;
      let DealerPrice = '';
      let EndUserPrice = '';
      if (
        suggestedDealerPrice !== undefined &&
        JSON.parse(suggestedDealerPrice) &&
        JSON.parse(suggestedEndUserPrice)['NZI']
      ) {
        DealerPrice = JSON.parse(suggestedDealerPrice)['NZI'];
        EndUserPrice = JSON.parse(suggestedEndUserPrice)['NZI'];
      } else if (suggestedDealerPrice !== undefined) {
        DealerPrice = JSON.parse(suggestedDealerPrice)[selectedZoneId || zoneIds[0]];
        EndUserPrice = JSON.parse(suggestedEndUserPrice)[selectedZoneId || zoneIds[0]];
      } else {
        DealerPrice = 0;
        EndUserPrice = 0;
      }
      const msrp = DealerPrice || EndUserPrice;
      let totalOrderQty = 0;
      const cmp = this.props.customerMonsantoProduct.filter(
        (p) => p.monsantoProductId == product.productId && p.isSent === true,
      );
      cmp.map((p) => {
        totalOrderQty += parseFloat(p.orderQty);
      });

      const { deliveryReceipts } = this.props;
      const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
      const quatityID = deliveryReceiptDetails.filter((data) => data.monsantoProductId === product.Product.id);
      const deliveryQtyisReturn = getDeliveryLotsQtyReturn(quatityID, deliveryReceipts);
      const deliveryQty = getDeliveryLotsQty(quatityID, deliveryReceipts);
      const value = getWareHouseValue(product.Product);
      const productOriginalQuantity = Number.parseInt(0);
      const wareHouseValue = productOriginalQuantity + value - deliveryQty + deliveryQtyisReturn;
      const longShort =
        Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
        product.demand;
      let sumData = [];
      deliveryReceiptDetails &&
        deliveryReceiptDetails
          .filter((item) => product.productId === item.monsantoProductId)
          .reduce(function (res, value) {
            const pID = value.monsantoProductId;
            if (!res[pID]) {
              res[pID] = {
                monsantoProductId: value.monsantoProductId,
                amountDelivered: 0,
                customerMonsantoProductId: value.customerMonsantoProductId,
              };
              sumData.push(res[pID]);
            }
            res[pID].amountDelivered += Number(value.amountDelivered);

            return res;
          }, {});
      tabledata.push({
        ProductDetail: product.Product.productDetail,
        Variety: product.Product.blend,
        Trait: product.Product.brand,
        RM: rm,
        Treatment: product.Product.treatment,
        Packaging: product.Product.packaging ? product.Product.packaging : '-',
        Seedsize: product.Product.seedSize ? product.Product.seedSize : '-',
        MSRP: parseFloat(EndUserPrice || 0),
        DealerPrice: parseFloat(DealerPrice === null ? 0 : DealerPrice || 0),
        DeliveredToGrower: sumData.length > 0 ? sumData[0].amountDelivered : 0,
        DealerBucket: product.bayerDealerBucketQty,
        AllGrowers: product.allGrowerQty,
        Demand: product.demand,
        Supply: parseFloat(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0),
        LongShort: longShort,
        BayerAvailability:
          parseInt(product.Product.quantity || 0) >= 1000 ? '1000+' : parseFloat(product.Product.quantity || 0),
        AllGrowers_IncludingUnSynced: parseFloat(totalOrderQty || 0),
        productId: String(product.productId),
        WarehouseOnHand: wareHouseValue,
      });
    });

    let totalrm = 0,
      totalallGrowerQty = 0,
      totaldemand = 0,
      totalsupply = 0,
      totallongShort = 0,
      totalallGrowersUnsynced = 0,
      totalbayerAvailability = 0,
      totaldealerPrice = 0,
      totalDealerBucket = 0,
      totalwareHouseValue = 0,
      totaldeliveredToGrower = 0,
      totalMsrp = 0;

    tabledata.map((c) => {
      totalrm += parseFloat(c.RM === '-' ? 0 : c.RM);
      totalallGrowerQty += parseFloat(c.AllGrowers || 0);
      totaldemand += parseFloat(c.Demand || 0);
      totalsupply += parseFloat(c.Supply || 0);
      totallongShort += parseFloat(c.LongShort || 0);
      totalDealerBucket += parseFloat(c.DealerBucket || 0);
      totalallGrowersUnsynced += parseFloat(c.AllGrowers_IncludingUnSynced || 0);
      totalMsrp += parseFloat(c.MSRP || 0);
      totalbayerAvailability += parseFloat(c.BayerAvailability || 0);
      totaldealerPrice += parseFloat(c.DealerPrice || 0);
      totalwareHouseValue += parseFloat(c.WarehouseOnHand || 0);
      totaldeliveredToGrower += parseFloat(c.DeliveredToGrower || 0);
    });

    let totalDataRow = {
      ProductDetail: '-',
      Variety: '-',
      Trait: '-',
      Treatment: '-',
      Packaging: '-',
      Seedsize: '-',
      RM: '-',
      MSRP: '-',
      DealerBucket: '-',
      AllGrowers: totalallGrowerQty,
      DeliveredToGrower: totaldeliveredToGrower,
      Demand: totaldemand,
      Supply: totalsupply,
      LongShort: totallongShort,
      DealerBucket: totalDealerBucket,
      BayerAvailability: '-',
      AllGrowers_IncludingUnSynced: totalallGrowersUnsynced,
      DealerPrice: '-',
      WarehouseOnHand: totalwareHouseValue,
      productId: '-',
    };
    tabledata.splice(0, 0, totalDataRow);
    const columns = [];

    tabledata !== undefined &&
      tabledata.length > 0 &&
      Object.keys(tabledata[0])
        .filter(
          (s) =>
            s !== 'Variety' &&
            s !== 'Trait' &&
            s !== 'Treatment' &&
            s !== 'MSRP' &&
            s !== 'Seedsize' &&
            s !== 'Packaging',
        )
        .map((s) => {
          columns.push(s);
        });
    this.setState({
      inventoryListData: tabledata,
      growerField: columns.concat('All'),
    });

    // downloadCSV(csvData, `${this.props.productType}Inventory`);
  };

  getTrProps = (state, rowInfo, instance) => {
    if (rowInfo) {
      return {
        style: {
          'background-color': rowInfo.original.Variety === '-' || rowInfo.original.Product === '-' ? '#307a0830' : '',
          fontWeight: rowInfo.original.Variety === '-' || rowInfo.original.Product === '-' ? 900 : '',
        },
      };
    }
    return {};
  };
  exportInventoryNonBayer = async (data, type, companyId) => {
    const { seedCompanyId, customerProducts, deliveryReceipts, customers } = this.props;

    const productRelatedPurchaseOrders = getCustomerProducts(customers, type, parseInt(companyId), deliveryReceipts);

    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
    let totalDataRow = {};
    let tabledata = [];

    if (data.length > 0 && data[0].hasOwnProperty('companyId')) {
      let totalDealerPrice = 0,
        totalCostPerUnit = 0,
        totalQuantity = 0;
      data.forEach((item) => {
        tabledata.push({
          Product: item.name,
          Type: item.type,

          Description: item.description,
          ID: item.customId,
          Unit: item.unit,
          DealerPrice: item.dealerPrice === null ? 0 : item.dealerPrice,

          CostPerUnit: parseFloat(item.costUnit),
          Quantity: parseFloat(item.quantity),
        });
        totalDealerPrice += item.dealerPrice === null ? 0 : item.dealerPrice;
        totalCostPerUnit += parseFloat(item.costUnit);
        totalQuantity += parseFloat(item.quantity);
      });

      totalDataRow = {
        Product: '-',
        Type: '-',

        Description: '-',
        ID: '-',
        Unit: '-',
        DealerPrice: totalDealerPrice,

        CostPerUnit: parseFloat(totalCostPerUnit),
        Quantity: parseFloat(totalQuantity),
      };
    } else {
      // if(data.hasOwnProperty("seedCompanyId"))
      data.forEach((item) => {
        let seedshipped, growerOrder, deliveredGrowerOrder, seedDealerTransfer, longShort, qtyWarehouse;
        if (item.hasOwnProperty('seedCompanyTotalOrder')) {
          seedshipped = `${item.seedCompanyTotalShipped}/${item.seedCompanyTotalUnShipped}`;
          growerOrder = item.growerTotalOrder;
          deliveredGrowerOrder = `${item.growerTotalShipped}/${item.growerTotalUnShipped}`;
          seedDealerTransfer = `${item.seedDealerTotalTransferIn}/${item.seedDealerTotalTransferOut}`;
          longShort = item.longShorttotal;
          qtyWarehouse = item.warehouseTotal;
        } else {
          const shipped1 = getQtyShipped(item),
            unshipped1 = getQtyOrdered(item) - getQtyShipped(item);
          seedshipped = `${shipped1}/${unshipped1}`;

          const pos = productRelatedPurchaseOrders[item.id];

          const filteredProducts = customerProducts.filter((cp) => {
            if (pos === undefined) return false;
            return pos
              .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
              .map((p) => p.purchaseOrder.id)
              .includes(cp.purchaseOrderId);
          });
          growerOrder = getGrowerOrder(item, filteredProducts);

          const shipped2 = getGrowerOrderDelivered(item, deliveryReceiptDetails),
            unshipped2 = customerProducts
              .filter((order) => {
                if (productRelatedPurchaseOrders[item.id] === undefined) return false;
                return productRelatedPurchaseOrders[item.id]
                  .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
                  .map((p) => p.purchaseOrder.id)
                  .includes(order.purchaseOrderId);
              })
              .filter((order) => order.productId === item.id)
              .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0);
          deliveredGrowerOrder = `${shipped2}/${unshipped2}`;
          seedDealerTransfer = `${getTransferInAmount(item)}/${getTransferOutAmount(item)}`;
          longShort = getQtyOrdered(item) - getGrowerOrder(item, filteredProducts);
          //count warehouse quantity

          const quatityID = deliveryReceiptDetails.filter((data) => data.productId === item.id);
          const deliveryQtyisReturn = getDeliveryLotsQtyReturn(quatityID, deliveryReceipts); //delivery Return value
          const deliveryQty = getDeliveryLotsQty(quatityID, deliveryReceipts);
          qtyWarehouse =
            getQtyShipped(item) +
            getTransferInAmount(item) -
            getTransferOutAmount(item) -
            deliveryQty +
            deliveryQtyisReturn;
        }
        tabledata.push({
          Trait: item.brand,
          Variety: item.blend,
          RM: item.rm,
          Treatment: item.treatment,
          DealerPrice: item.dealerPrice === null ? 0 : item.dealerPrice,

          MSRP: item.msrp,
          SeedCompany_Ordered: item.hasOwnProperty('seedCompanyTotalOrder')
            ? item.seedCompanyTotalOrder
            : getQtyOrdered(item),
          SeedCompany_ShippedUnshipped: seedshipped,
          Grower_Ordered: growerOrder,
          GrowerShipped_Unshipped: deliveredGrowerOrder,

          SeedDealer_TransferInOut: seedDealerTransfer,
          LongShort: longShort,

          Warehouse: qtyWarehouse,
        });
      });

      let totalMSRP = 0,
        totalSeedCompany_Ordered = 0,
        seedCompanyTotalShipped = 0,
        seedCompanyTotalUnShipped = 0,
        totalGrower_Ordered = 0,
        totalDealerPrice = 0,
        totalLongShort = 0,
        growerTotalShipped = 0,
        growerTotalUnShipped = 0,
        seedDealerTotalTransferIn = 0,
        seedDealerTotalTransferOut = 0,
        totalWarehouse = 0;

      tabledata.map((item) => {
        // console.log(item.Grower_Ordered);
        seedCompanyTotalShipped += parseFloat(item.SeedCompany_ShippedUnshipped.split('/')[0]);
        seedCompanyTotalUnShipped += parseFloat(item.SeedCompany_ShippedUnshipped.split('/')[1]);

        growerTotalShipped += parseFloat(item.GrowerShipped_Unshipped.split('/')[0]);
        growerTotalUnShipped += parseFloat(item.GrowerShipped_Unshipped.split('/')[1]);

        seedDealerTotalTransferIn += parseFloat(item.SeedDealer_TransferInOut.split('/')[0]);
        seedDealerTotalTransferOut += parseFloat(item.SeedDealer_TransferInOut.split('/')[1]);

        totalMSRP += parseFloat(item.MSRP);
        totalSeedCompany_Ordered += parseFloat(item.SeedCompany_Ordered);
        totalGrower_Ordered += parseFloat(item.Grower_Ordered);
        totalLongShort += parseFloat(item.LongShort);
        totalWarehouse += parseFloat(item.Warehouse);
        totalDealerPrice += parseFloat(item.DealerPrice);
      });

      totalDataRow = {
        Trait: '-',
        Variety: '-',
        RM: '-',
        Treatment: '-',
        DealerPrice: '-',

        MSRP: '-',
        SeedCompany_Ordered: totalSeedCompany_Ordered.toLocaleString('en-US'),
        SeedCompany_ShippedUnshipped: `${seedCompanyTotalShipped} / ${seedCompanyTotalUnShipped}`,
        Grower_Ordered: totalGrower_Ordered.toLocaleString('en-US'),
        GrowerShipped_Unshipped: `${growerTotalShipped} / ${growerTotalUnShipped}`,

        SeedDealer_TransferInOut: `${seedDealerTotalTransferIn} / ${seedDealerTotalTransferOut}`,
        LongShort: totalLongShort.toLocaleString('en-US'),

        Warehouse: totalWarehouse.toLocaleString('en-US'),
      };
    }
    tabledata.splice(0, 0, totalDataRow);
    const columns = [];
    tabledata.length > 0 &&
      Object.keys(tabledata[1]).map((s) => {
        columns.push(s);
      });
    this.setState({
      inventoryListData: tabledata,
      growerField: columns.concat('All'),
    });
  };

  generateReport = async (tableData) => {
    this.setState({ inventoryListData: [] });
    const { selectedCroptype, selectedCompaines } = this.state;
    const companyType = selectedCompaines != '' && selectedCompaines.split('-')[0];
    const companyId = selectedCompaines != '' && selectedCompaines.split('-')[1];

    const type = companyType === 'regular' ? 'Company' : 'Seed Company';

    if (companyType === 'bayer') {
      let cropType;
      if (selectedCroptype === 'alfalfa') {
        cropType = 'A';
      } else if (selectedCroptype === 'canola') {
        cropType = 'L';
      } else if (selectedCroptype === 'corn') {
        cropType = 'C';
      } else if (selectedCroptype === 'sorghum') {
        cropType = 'S';
      } else if (selectedCroptype === 'soybean') {
        cropType = 'B';
      } else if (selectedCroptype === 'packaging') {
        cropType = 'P';
      }
      if (cropType == 'P') {
        this.setState({ selectedZoneId: 'NZI' });
        this.exportCsvBayer(this.state.packagingData);
      } else {
        await this.fetchRetailerOrderSummary(cropType, companyId);
      }
    } else if (companyType != '') {
      await this.exportInventoryNonBayer(tableData, type, companyId);
    }
  };
  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.monsantoRetailerOrderSummaryProducts.length !== this.props.monsantoRetailerOrderSummaryProducts.length
    ) {
      this.setState({ inventoryListData: [] });
      this.exportCsvBayer(this.props.monsantoRetailerOrderSummaryProducts);
    }
  }

  handleChange = async (event, name, reportName) => {
    let data = [];
    const {
      target: { value, checked },
    } = event;

    // for acompare actual data lenght and when click on All set All data

    await Object.keys(this.state.inventoryListData[this.state.inventoryListData.length == 1 ? 0 : 1]).map((g) =>
      data.push(g),
    );

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

  render() {
    const {
      seedCompanies,
      companies,
      apiSeedCompanies,
      classes,
      organizationId,
      isOnline,
      monsantoRetailerOrderSummaryProducts,
      apiSeedCompaniesloadingStatus,
      monsantoRetailerOrderSummaryStatus,
    } = this.props;
    const {
      selectedCompaines,
      packagingData,
      moreFuncMenuOpen,
      growerField,
      selectedCroptype,
      inventoryListData,
      isLoading,
    } = this.state;
    let cropTypes = [];
    let tableData = [];
    const companyType = selectedCompaines != '' && selectedCompaines.split('-')[0];
    const companyId = selectedCompaines != '' && selectedCompaines.split('-')[1];

    if (companyType === 'bayer') {
      const data = apiSeedCompanies.filter((s) => s.id === parseInt(companyId))[0];
      cropTypes.push(
        // data.alfalfaBrandName,
        data.canolaBrandName,
        data.cornBrandName,
        data.sorghumBrandName,
        data.soybeanBrandName,
        'packaging',
      );
    } else if (companyType === 'seed') {
      const data = seedCompanies.filter((s) => s.id === parseInt(companyId))[0];
      cropTypes = Object.keys(JSON.parse(data.metadata));

      tableData = data.Products.filter((p) => p.seedType === selectedCroptype.toUpperCase());
    } else if (companyType === 'regular') {
      const data = companies.filter((s) => s.id === parseInt(companyId))[0];

      tableData = data.CustomProducts;
    }

    const csvFileName = `export${companyType}-${selectedCroptype} Inventory.csv`;

    if (isOnline && apiSeedCompaniesloadingStatus.length < 0) {
      return <CircularProgress />;
    }
    let Inventory = [];
    let reportColumn = [];
    inventoryListData.length > 0 &&
      Object.keys(inventoryListData[0])
        .filter((s) => growerField.find((gf) => gf == s))
        .map((s) => {
          Inventory.push({
            Header:
              s.includes('_') === true ? (
                <p>
                  {s.split('_')[0]}
                  <br></br>
                  {s.split('_')[1]}
                </p>
              ) : (
                s
              ),
            id: s,
            accessor: (d) => d,
            Cell: (props) => {
              return (
                <div style={{ cursor: 'pointer' }}>
                  {typeof props.value[s] === 'number' && s == 'MSRP' ? numberToDollars(props.value[s]) : props.value[s]}
                </div>
              );
            },
            // accessor: s,
            width: s.length > 14 ? 160 : 120,
            headerStyle: {
              fontSize: '15px',
              fontWeight: 'bold',
              textTransform: 'capitalize',
              textAlign: 'left',
            },
          });
        });
    inventoryListData.length > 0 && Object.keys(inventoryListData[0]).filter((s) => reportColumn.push(s));

    let csvdata = [];

    inventoryListData.map(async (s) => {
      let data = {};
      Object.keys(s)
        .filter((s) => growerField.find((gf) => gf == s))
        .map((d) => {
          const type = typeof s[d];
          if (type === 'number' && s == 'MSRP') {
            data[d] = numberToDollars(s[d] || 0);
          } else {
            data[d] = s[d];
          }
        });
      return csvdata.push(data);
    });

    return (
      <div>
        <h3 className={classes.cardIconTitle}> Inventory Report</h3>

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
                    {apiSeedCompanies.length > 0 &&
                      apiSeedCompanies.map((bayer) => {
                        return (
                          <MenuItem value={`bayer-${bayer.id}`} key={bayer.id} id="bayer">
                            {bayer.name}
                          </MenuItem>
                        );
                      })}
                    {companies.length > 0 &&
                      companies.map((regular) => {
                        return (
                          <MenuItem value={`regular-${regular.id}`} key={regular.id} id={`regular-${regular.id}`}>
                            {regular.name}
                          </MenuItem>
                        );
                      })}
                    {seedCompanies.length > 0 &&
                      seedCompanies.map((seed) => {
                        return (
                          <MenuItem value={`seed-${seed.id}`} key={seed.id} id={`seed-${seed.id}`}>
                            {seed.name}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>

                {cropTypes.length > 0 && (
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }} style={{ marginRight: '40px' }}>
                    <InputLabel id="demo-simple-select-standard-label">Select CropType</InputLabel>
                    <Select
                      value={selectedCroptype}
                      onChange={this.handeleTransferInfoChange('selectedCroptype')}
                      autoWidth
                      id="selectedCropType"
                      inputProps={{
                        className: classes.packagingSelect,
                        required: true,
                        name: 'cropType',
                        id: 'cropType',
                      }}
                    >
                      {cropTypes.length > 0 &&
                        cropTypes.map((ct) => {
                          const idName = ct.toLocaleLowerCase();
                          return (
                            <MenuItem value={ct} key={ct} id={idName.replace(/ /g, '')}>
                              {ct}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                )}

                {inventoryListData.length > 0 && (
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
                  Generate Report
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
              {inventoryListData.length > 0 &&
              (monsantoRetailerOrderSummaryStatus === 'Loaded' ||
                companyType !== 'bayer' ||
                packagingData.length > 0) ? (
                <ReactTable
                  data={inventoryListData}
                  columns={Inventory}
                  minRows={1}
                  showPagination={false}
                  LoadingComponent={Loading}
                  loading={true}
                  getTrProps={this.getTrProps}
                  pageSize={inventoryListData.length}
                />
              ) : monsantoRetailerOrderSummaryStatus === 'Loading' ? (
                <div
                  className="-loading -active"
                  style={{ display: 'flex', justifyContent: 'center', marginTop: '45px' }}
                >
                  <div className="-loading-inner">
                    <CircularProgress />
                  </div>
                </div>
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
                  data={csvdata || []}
                  style={{ color: '#2F2E2E' }}
                  filename={csvFileName}
                  // headers={filterHeader}
                >
                  <span>Download CSV</span>
                </CSVLink>
              </MenuItem>
              <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  this.props.history.push({
                    pathname: `/app/bayer_orders_preview/InventoryReport`,
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

export default withStyles(inventoryReportStyles)(InventoryReport);
