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

import { dealerReturnReceiveStyles } from './dealerReturnReceive_reportStyles';

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
class DealerReturnReceiveReport extends Component {
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
    data.forEach((product) => {
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
      const cmp = this.props.customerMonsantoProduct.filter((p) => p.monsantoProductId == product.productId);
      cmp.map((p) => {
        totalOrderQty += parseInt(p.orderQty);
      });

      if (
        product.Product.classification == 'P'
          ? product.Product.lots.length > 0
          : product.Product.monsantoLots && product.Product.monsantoLots.length > 0
      ) {
        (product.Product.classification == 'P' ? product.Product.lots : product.Product.monsantoLots).forEach((lot) => {
          tabledata.push({
            ProductDetail: product.Product.productDetail,
            Variety: product.Product.blend,
            Trait: product.Product.brand,
            RM: rm,

            DealerBucket: product.bayerDealerBucketQty,
            AllGrowers: product.allGrowerQty || 0,

            LongShort:
              Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
                product.demand || 0,
            BayerAvailability: parseInt(product.Product.quantity) >= 1000 ? '1000+' : product.Product.quantity,
            AllGrowersIncludingUnSynced: totalOrderQty,
            productId: product.productId,

            lotNumber: lot.lotNumber,
            BillofLading: lot.shipNotice,
            shipDate: moment.utc(lot.shipDate).format('YYYY-MM-DD'),
            quantity: lot.quantity,
            receivedQty: lot.receivedQty,
            deliveryDate: moment.utc(lot.deliveryDate).format('YYYY-MM-DD'),
            deliveryNoteNumber: lot.deliveryNoteNumber,
            ReturnReceived: lot.isReturn ? 'Return' : 'Received',
          });
        });
      }
    });

    let totalallGrowerQty = 0,
      totallongShort = 0,
      totalallGrowersUnsynced = 0,
      totalbayerAvailability = 0,
      totaldealerPrice = 0,
      totalDealerBucket = 0,
      totalwareHouseValue = 0;

    tabledata.map((c) => {
      totalallGrowerQty += parseFloat(c.AllGrowers || 0);

      totallongShort += parseFloat(c.LongShort || 0);
      totalDealerBucket += parseFloat(c.DealerBucket || 0);
      totalallGrowersUnsynced += parseFloat(c.AllGrowers_IncludingUnSynced || 0);

      totaldealerPrice += parseFloat(c.DealerPrice || 0);
    });

    let totalDataRow = {
      ProductDetail: '-',
      Variety: '-',
      Trait: '-',
      RM: '-',
      DealerBucket: '-',
      AllGrowers: totalallGrowerQty,
      LongShort: totallongShort,
      BayerAvailability: totalbayerAvailability,
      AllGrowersIncludingUnSynced: '-',

      productId: '-',
      lotNumber: '-',
      BillofLading: '-',
      shipDate: '-',
      quantity: '-',
      receivedQty: '-',
      deliveryDate: '-',
      deliveryNoteNumber: '-',
      ReturnReceived: '-',
    };
    tabledata.splice(0, 0, totalDataRow);

    const columns = [];
    tabledata.length > 0 &&
      Object.keys(tabledata[0]).map((s) => {
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

  generateReport = async (tableData) => {
    this.setState({ inventoryListData: [] });
    const { selectedCroptype, selectedCompaines } = this.state;
    const companyType = selectedCompaines != '' && selectedCompaines.split('-')[0];
    const companyId = selectedCompaines != '' && selectedCompaines.split('-')[1];

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

    await Object.keys(this.state.inventoryListData[0]).map((g) => data.push(g));

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
    }
    const csvFileName = `export${companyType}-${selectedCroptype} Inventory.csv`;

    if (isOnline && apiSeedCompaniesloadingStatus.length < 0) {
      return <CircularProgress />;
    }
    let Inventory = [];
    let reportColumn = [];

    let pdfHeader = [];

    inventoryListData.length > 0 &&
      Object.keys(inventoryListData[0])
        .filter((s) => growerField.find((gf) => gf == s))
        .map((s) => {
          Inventory.push({
            Header: s,
            id: s,
            accessor: (d) => d,
            Cell: (props) => {
              return <div style={{ cursor: 'pointer' }}>{props.value[s]}</div>;
            },
            width: s.length > 14 ? 160 : 120,
            headerStyle: {
              fontSize: '15px',
              fontWeight: 'bold',
              textTransform: 'capitalize',
              textAlign: 'left',
            },
          });
          pdfHeader.push(s);
        });
    inventoryListData.length > 0 && Object.keys(inventoryListData[0]).filter((s) => reportColumn.push(s));

    return (
      <div>
        <h3 className={classes.cardIconTitle}>DealerReturenReceive Report</h3>

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

                <Button color="primary" id="generateReport" onClick={() => this.generateReport(tableData)}>
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
              (packagingData.length > 0 ||
                monsantoRetailerOrderSummaryStatus === 'Loaded' ||
                companyType !== 'bayer') ? (
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
                  data={inventoryListData || []}
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
                    pathname: `/app/bayer_orders_preview/dealerReceiveReturn`,
                    state: { data: inventoryListData, header: pdfHeader },
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

export default withStyles(dealerReturnReceiveStyles)(DealerReturnReceiveReport);
