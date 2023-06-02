import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ReactTable from 'react-table';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Checkbox from '@material-ui/core/Checkbox';

import Button from '../../../components/material-dashboard/CustomButtons/Button';
import { flatten } from 'lodash/array';
import { sortBy } from 'lodash';
import { CSVLink } from 'react-csv';
import Paper from '@material-ui/core/Paper';
import { numberToDollars } from '../../../utilities';
import axios from 'axios';
import { customerProductDiscountsTotals } from '../../../utilities';
import ListItemText from '@material-ui/core/ListItemText';
import OutlinedInput from '@material-ui/core/OutlinedInput';

import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

import Popover from '@material-ui/core/Popover';

import MenuList from '@material-ui/core/MenuList';

import { profitReportStyles } from './profit_reportstyles';
import SweetAlert from 'react-bootstrap-sweetalert';
import { uniqBy, uniq } from 'lodash';

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
class ProfitReport extends Component {
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
    };
  }

  componentDidMount = async () => {
    await this.props.listCompanies();
    await this.props.listSeedCompanies();
    await this.props.listApiSeedCompanies();
    await this.props.listCustomerCustomProducts(true);
    await this.props.listCustomerMonsantoProducts(true);
    await this.props.listCustomerProducts(true);
  };
  handeleTransferInfoChange = (name) => (event) => {
    this.setState({ inventoryListData: [], [name]: event.target.value });
  };
  handleMoreFuncMenuClose = (event) => {
    this.setState({ moreFuncMenuOpen: false });
  };
  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };
  handleChange = async (event, name, reportName) => {
    let data = [];
    const {
      target: { value, checked },
    } = event;

    // for acompare actual data lenght and when click on All set All data

    await Object.keys(this.state.inventoryListData[0]).map((g) => g !== 'ordered' && data.push(g));

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

  exportCsvBayer = async (cropType) => {
    let totalDiscount = 0;
    let tabledata = [];
    let totals = {
      subTotal: 0,
      quantity: 0,
    };
    await this.props.customerMonsantoProduct
      .filter((c) => c.MonsantoProduct.classification == cropType)
      .map((product) => {
        const { suggestedDealerPrice, suggestedEndUserPrice } = product.MonsantoProduct.LineItem || {};
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
          DealerPrice = JSON.parse(suggestedDealerPrice)[product.MonsantoProduct.zoneId[0] || zoneIds[0]];
          EndUserPrice = JSON.parse(suggestedEndUserPrice)[product.MonsantoProduct.zoneId[0] || zoneIds[0]];
        } else {
          DealerPrice = 0;
          EndUserPrice = 0;
        }
        const discountsPOJO =
          product &&
          product.discounts &&
          product.discounts.length > 0 &&
          product.discounts
            .map((discount) => {
              return this.props.dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
            })
            .filter((el) => el);
        const {
          discounts,
          discountAmount,
          total: customerProductDiscountsTotal,
        } = customerProductDiscountsTotals(product, discountsPOJO, product, null, null, null, product.PurchaseOrder);
        totals.subTotal += customerProductDiscountsTotal;
        totals.quantity += product.orderQty;
        let ordered =
          product &&
          product.discounts
            .sort((a, b) => a && a.product - b.product)
            .map((discount) => discounts[discount.DiscountId])
            .filter((x) => x);
        const DiscountsNameList = () => {
          return (
            <div className={this.props.classes.discountList}>
              {ordered.map((discount) => (
                <div className={this.props.classes.discountListItem} key={discount.dealerDiscount.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span> {discount.dealerDiscount.name.substring(0, 25) + '  (' + discount.value + ')'}</span>
                    <span> {numberToDollars(discount.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        };

        tabledata.push({
          productDetail: product.MonsantoProduct.productDetail,
          DealerPrice: numberToDollars(DealerPrice),
          EndUserPrice: numberToDollars(EndUserPrice),
          orderQty: `${product.orderQty} Units`,
          msrp: numberToDollars(product.msrpEdited ? product.msrpEdited : product.price),
          discounts: <DiscountsNameList />,
          ordered: ordered,
        });
      });

    const columns = ['All'];

    tabledata.length > 0 &&
      Object.keys(tabledata[0]).map((s) => {
        s !== 'ordered' && columns.push(s);
      });
    this.setState({
      inventoryListData: tabledata,
      growerField: columns,
    });
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
  exportNonBayer = async (type, companyId) => {
    let tabledata = [];
    let totals = {
      subTotal: 0,
      quantity: 0,
    };
    const { customerProducts, customerCustomProducts } = this.props;

    const nonbayerData = type === 'Company' ? customerCustomProducts : customerProducts;

    await nonbayerData
      .filter((c) =>
        type == 'Company' ? c.CustomProduct.companyId == companyId : c.Product && c.Product.seedCompanyId == companyId,
      )
      .map((product) => {
        let DealerPrice = 0;
        let EndUserPrice = 0;

        const discountsPOJO =
          product &&
          product.discounts &&
          product.discounts.length > 0 &&
          product.discounts
            .map((discount) => {
              return this.props.dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
            })
            .filter((el) => el);
        const {
          discounts,
          discountAmount,
          total: customerProductDiscountsTotal,
        } = customerProductDiscountsTotals(product, discountsPOJO, product, null, null, null, product.PurchaseOrder);
        totals.subTotal += customerProductDiscountsTotal;
        totals.quantity += product.orderQty;
        let ordered =
          product &&
          product.discounts
            .sort((a, b) => a && a.product - b.product)
            .map((discount) => discounts[discount.DiscountId])
            .filter((x) => x);
        const DiscountsNameList = () => {
          return (
            <div className={this.props.classes.discountList}>
              {ordered.map((discount) => (
                <div className={this.props.classes.discountListItem} key={discount.dealerDiscount.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span> {discount.dealerDiscount.name.substring(0, 25) + '  (' + discount.value + ')'}</span>
                    <span> {numberToDollars(discount.amount)}</span>
                  </div>
                  <div style={{ color: '#c9c5c5', margin: '-7px 0px -7px 0px' }}></div>
                </div>
              ))}
            </div>
          );
        };
        let productDetail = '';
        if (type == 'Company') {
          productDetail = `${product.CustomProduct.name}/${product.CustomProduct.description}/${product.CustomProduct.type}`;
        } else {
          productDetail = `${product.Product.blend}/${product.Product.brand}/${product.Product.treatment}`;
        }

        let msrp =
          product.msrpEdited === null
            ? type === 'Company'
              ? product.CustomProduct.costUnit
              : product.Product.msrp
            : product.msrpEdited;

        tabledata.push({
          productDetail: productDetail,
          DealerPrice: numberToDollars(DealerPrice),
          EndUserPrice: numberToDollars(EndUserPrice),
          orderQty: `${product.orderQty} Units`,
          msrp: numberToDollars(msrp),
          ordered: ordered,
          discounts: <DiscountsNameList />,
        });
      });

    const columns = ['All'];
    tabledata.length > 0 &&
      Object.keys(tabledata[0]).map((s) => {
        s !== 'ordered' && columns.push(s);
      });
    this.setState({
      inventoryListData: tabledata,
      growerField: columns,
    });
  };

  generateReport = async () => {
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
      }

      await this.exportCsvBayer(cropType);
    } else if (companyType != '') {
      await this.exportNonBayer(type, companyId);
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

      apiSeedCompaniesloadingStatus,
      monsantoRetailerOrderSummaryStatus,
    } = this.props;

    const { selectedCompaines, moreFuncMenuOpen, selectedCroptype, inventoryListData, isLoading, growerField } =
      this.state;
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
      );
    } else if (companyType === 'seed') {
      const data = seedCompanies.filter((s) => s.id === parseInt(companyId))[0];
      cropTypes = Object.keys(JSON.parse(data.metadata));

      tableData = data.Products.filter((p) => p.seedType === selectedCroptype.toUpperCase());
    } else if (companyType === 'regular') {
      const data = companies.filter((s) => s.id === parseInt(companyId))[0];

      tableData = data.CustomProducts;
    }

    const csvFileName = `export${companyType}-${selectedCroptype} ProfitReport.csv`;

    if (isOnline && apiSeedCompaniesloadingStatus.length < 0) {
      return <CircularProgress />;
    }
    let Inventory = [];
    let reportColumn = [];
    inventoryListData.length > 0 &&
      Object.keys(inventoryListData[0])
        .filter((s) => growerField.find((gf) => gf == s))
        .map((s) => {
          s !== 'ordered' &&
            Inventory.push({
              Header: s,
              id: s,
              accessor: (d) => d,
              Cell: (props) => {
                return <div style={{ cursor: 'pointer' }}>{props.value[s]}</div>;
              },

              width: s == 'discounts' ? 200 : 120,
              headerStyle: {
                fontSize: '15px',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                textAlign: 'left',
              },
            });
        });

    let csvdata = [];
    inventoryListData.length > 0 &&
      Object.keys(inventoryListData[0]).filter((s) => s !== 'ordered' && reportColumn.push(s));

    inventoryListData.map(async (s) => {
      let data = {};
      Object.keys(s)
        .filter((s) => growerField.find((gf) => gf == s))
        .map((d) => {
          const type = typeof s[d];
          if (type === 'number') {
            data[d] = numberToDollars(s[d] || 0);
          } else if (type == 'object') {
            s['ordered'].length > 0 &&
              s['ordered'].map(
                (discount) =>
                  (data[discount.dealerDiscount.name.substring(0, 25) + '  (' + discount.value + ')'] = numberToDollars(
                    discount.amount,
                  )),
              );
          } else {
            data[d] = s[d];
          }
        });
      return csvdata.push(data);
    });

    return (
      <div>
        <h3 className={classes.cardIconTitle}> Profit Report</h3>

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

                <Button color="primary" id="generateReport" onClick={() => this.generateReport(tableData)}>
                  Generate Profit Report
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
              {inventoryListData.length > 0 ? (
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
                    pathname: `/app/bayer_orders_preview/profileReport`,
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
        {/* {inventoryListData.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            buttonRef={(node) => {
              this.addNewAnchorEl = node;
            }}
            id="downloadCsv"
          >
            <CSVLink
              data={inventoryListData || []}
              style={{ color: '#2F2E2E' }}
              filename={csvFileName}
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

export default withStyles(profitReportStyles)(ProfitReport);
