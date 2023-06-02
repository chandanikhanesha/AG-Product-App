import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import SweetAlert from 'react-bootstrap-sweetalert';
import { format } from 'date-fns';

import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Card from '../../../components/material-dashboard/Card/Card';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Close';

import { statementSettingStyles } from './statement_setting.styles';

import AddFinanceMethodDialog from './add_finance_method_dialog';
import EditFinanceMethodDialog from './edit_finance_method_dialog';
import AddDelayDialog from './add_delay_dialog';
import EditDelayDialog from './edit_delay_dialog';
import { isUnloadedOrLoading } from '../../../utilities';

class StatementSetting extends Component {
  state = {
    monthlyPicker: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    ],
    weeklyPicker: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    period: 'monthly',
    startDate: null,
    addFinanceOpen: false,
    editFinaceOpen: false,
    activeFinanceItem: null,
    addDelayOpen: false,
    editDelayOpen: false,
    activeDelayItem: null,
    stetementSetting: null,
    delayProducts: [],
    financeMethods: [],
    deleteFinanceMethodConfirm: null,
    deleteDelayProductsConfirm: null,
  };

  componentWillMount = async () => {
    this.loadDatas();
  };

  loadDatas = async () => {
    await this.props.listStatementSettings(true);
    await this.props.listFinanceMethods(true);
    await this.props.listDelayProducts(true);
    setTimeout(() => {
      const { statementSettings, delayProducts, financeMethods, organizationId } = this.props;
      let currentStatementSetting = statementSettings.find(
        (ss) => parseInt(ss.organizationId, 10) === parseInt(organizationId, 10),
      );
      if (currentStatementSetting) {
        this.setState({
          statementSetting: currentStatementSetting,
          period: currentStatementSetting.period,
          startDate: currentStatementSetting.compoundingDays,
        });
      }
      let currentdelayProducts = delayProducts.filter(
        (dp) => parseInt(dp.organizationId, 10) === parseInt(organizationId, 10),
      );
      let currentfinanceMethods = financeMethods.filter(
        (fm) => parseInt(fm.organizationId, 10) === parseInt(organizationId, 10),
      );
      this.setState({
        delayProducts: currentdelayProducts.sort((a, b) => a.id - b.id),
        financeMethods: currentfinanceMethods.sort((a, b) => a.id - b.id),
      });
    }, 500);
  };

  handlePeriodChange = (event) => {
    this.setState({ period: event.target.value });
  };
  handleStartDateChange = (event) => {
    this.setState({ startDate: event.target.value });
  };

  handleAddFinanceDialogOpen = () => {
    this.setState({ addFinanceOpen: true });
  };

  handleAddFinanceDialogClose = () => {
    this.setState({ addFinanceOpen: false }, () => {
      this.loadDatas();
    });
  };

  handleEditFinanceDialogOpen = (item) => {
    this.setState({ editFinaceOpen: true, activeFinanceItem: item });
  };

  handleEditFinanceDialogClose = () => {
    this.setState({ editFinaceOpen: false, activeFinanceItem: null });
  };

  handleAddDelayDialogOpen = () => {
    this.setState({ addDelayOpen: true });
  };
  handleAddDelayDialogClose = () => {
    this.setState({ addDelayOpen: false }, () => {
      this.loadDatas();
    });
  };

  handleEditdDelayDialogOpen = (item) => {
    this.setState({ editDelayOpen: true, activeDelayItem: item });
  };
  handleEditDelayDialogClose = () => {
    this.setState({ editDelayOpen: false, activeDelayItem: null });
  };

  saveStatementSetting = async () => {
    const { createStatementSetting, updateStatementSetting, organizationId } = this.props;
    const { statementSetting, period, startDate } = this.state;
    let statementSettingData = {
      period,
      compoundingDays: startDate,
      organizationId: organizationId,
    };
    if (statementSetting && statementSetting.id) {
      await updateStatementSetting(statementSetting.id, statementSettingData).then((res) => {
        this.loadDatas();
      });
    } else {
      await createStatementSetting(statementSettingData).then(() => {
        this.loadDatas();
      });
    }
  };

  deleteFinanceMethod = (method) => {
    const { deleteFinanceMethod, classes } = this.props;
    method &&
      this.setState({
        deleteFinanceMethodConfirm: (
          <SweetAlert
            warning
            showCancel
            title={`Delete Finance Method`}
            onConfirm={async () => {
              await deleteFinanceMethod(method.id);
              this.setState({ deleteFinanceMethodConfirm: null }, () => {
                this.loadDatas();
              });
            }}
            onCancel={() => {
              this.setState({
                deleteFinanceMethodConfirm: null,
              });
            }}
            confirmBtnCssClass={classes.button + ' ' + classes.success}
            cancelBtnCssClass={classes.button + ' ' + classes.danger}
          >
            Are you sure you want to delete this finance method? This will also affect on statements.
          </SweetAlert>
        ),
      });
  };

  deleteDelayProduct = (delayProduct) => {
    const { deleteDelayProduct, classes } = this.props;
    delayProduct &&
      this.setState({
        deleteDelayProductsConfirm: (
          <SweetAlert
            warning
            showCancel
            title={`Delete Delay Product`}
            onConfirm={async () => {
              await deleteDelayProduct(delayProduct.id);
              this.setState({ deleteDelayProductsConfirm: null }, () => {
                this.loadDatas();
              });
            }}
            onCancel={() => {
              this.setState({
                deleteDelayProductsConfirm: null,
              });
            }}
            confirmBtnCssClass={classes.button + ' ' + classes.success}
            cancelBtnCssClass={classes.button + ' ' + classes.danger}
          >
            Are you sure you want to delete this delay product? This will also affect on statements.
          </SweetAlert>
        ),
      });
  };

  get isLoading() {
    const loading = [
      this.props.statementSettingsLoadingStatus,
      this.props.delayProductsLoadingStatus,
      this.props.financeMethodsLoadingStatus,
      this.props.companyLoadingStatus,
      this.props.seedCompaniesLoadingStatus,
    ].some(isUnloadedOrLoading);

    return loading;
  }

  createStatementsNow = () => {
    this.props.createStatementsNow();
  };

  render() {
    if (this.isLoading) return <CircularProgress />;
    const {
      period,
      monthlyPicker,
      weeklyPicker,
      startDate,
      addFinanceOpen,
      editFinaceOpen,
      activeFinanceItem,
      addDelayOpen,
      editDelayOpen,
      activeDelayItem,
      delayProducts,
      financeMethods,
      deleteFinanceMethodConfirm,
      deleteDelayProductsConfirm,
    } = this.state;
    const { classes, companies, seedCompanies } = this.props;
    return (
      <div>
        <div className={classes.actionBarStyles}>
          <p className={classes.header}>Statement Setting</p>
          <div>
            <Tooltip title="Create statements immediately" arrow>
              <Button color="primary" className={classes.editButton} onClick={this.createStatementsNow}>
                CREATE
              </Button>
            </Tooltip>
            <Button color="primary" className={classes.editButton} onClick={this.saveStatementSetting}>
              SAVE
            </Button>
          </div>
        </div>
        <Card className={classes.cardstyles}>
          <CardHeader>
            <p className={classes.cardHeader}>Create Statement</p>
          </CardHeader>

          <Divider />
          <CardBody>
            <div className={classes.cardRow}>
              <FormControl style={{ marginBottom: '30px' }}>
                <FormLabel component="string" className={classes.formHeader}>
                  Period
                </FormLabel>
                <RadioGroup
                  aria-label="period"
                  name="period"
                  value={period}
                  onClick={this.handlePeriodChange}
                  classes={{ root: classes.radioGroupStyles }}
                >
                  <FormControlLabel
                    value="quarterly"
                    control={<Radio className={classes.radioOption} />}
                    label="Quarterly"
                    className={classes.radioLabel}
                  />
                  <FormControlLabel
                    value="monthly"
                    control={<Radio className={classes.radioOption} />}
                    label="Monthly"
                    className={classes.radioLabel}
                  />
                  <FormControlLabel
                    value="biweekly"
                    control={<Radio className={classes.radioOption} />}
                    label="Bi-weekly"
                    className={classes.radioLabel}
                  />
                  <FormControlLabel
                    value="weekly"
                    control={<Radio className={classes.radioOption} />}
                    label="Weekly"
                    className={classes.radioLabel}
                  />
                </RadioGroup>
              </FormControl>
            </div>
            <div>
              <p className={classes.formHeader}>When</p>
              <FormControl>
                <InputLabel shrink htmlFor="when">
                  Date
                </InputLabel>
                {(period === 'quarterly' || period === 'monthly') && (
                  <div>
                    <Select
                      value={startDate}
                      onChange={this.handleStartDateChange}
                      inputProps={{
                        required: true,
                        name: 'startDate',
                        id: 'startDate',
                      }}
                      className={classes.selectDate}
                    >
                      {monthlyPicker.map((day) => (
                        <MenuItem key={day} value={day}>
                          {day}
                        </MenuItem>
                      ))}
                    </Select>
                    <span>of every month</span>
                  </div>
                )}
                {(period === 'biweekly' || period === 'weekly') && (
                  <div>
                    <Select
                      value={startDate}
                      onChange={this.handleStartDateChange}
                      inputProps={{
                        required: true,
                        name: 'startDate',
                        id: 'startDate',
                      }}
                      className={classes.selectDate}
                    >
                      {weeklyPicker.map((day) => (
                        <MenuItem key={day} value={day}>
                          {day}
                        </MenuItem>
                      ))}
                    </Select>
                    <span className={classes.radioLabel}>of every week</span>
                  </div>
                )}
              </FormControl>
            </div>
          </CardBody>
        </Card>

        <Card className={classes.cardstyles}>
          <CardHeader>
            <div className={classes.actionBarStyles}>
              <p className={classes.cardHeader}>Finance method</p>
              <Button color="primary" className={classes.editButton} onClick={this.handleAddFinanceDialogOpen}>
                ADD
              </Button>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <Grid container>
              <Grid item xs={1}>
                <p className={classes.tableHeader}>Name</p>
              </Grid>
              <Grid item xs={3}>
                <p className={classes.tableHeader}>Seed Companiness</p>
              </Grid>
              <Grid item xs={3}>
                <p className={classes.tableHeader}>Companiness</p>
              </Grid>
              <Grid item xs={2}>
                <p className={classes.tableHeader}>Interest method</p>
              </Grid>
              <Grid item xs={2}>
                <p className={classes.tableHeader}>Interest rate</p>
              </Grid>
              <Grid item xs={1} />
            </Grid>
            {financeMethods.map((method) => {
              let companyName = '';
              let seedCompanyName = '';
              method.companyIds.forEach((companyId) => {
                let name = companies.find((company) => company.id === companyId).name;
                companyName === '' ? (companyName += name) : (companyName = companyName + ', ' + name);
              });
              method.seedCompanyIds &&
                method.seedCompanyIds.forEach((seedCompanyId) => {
                  let name = '';
                  let sc = seedCompanies.find((seedCompany) => seedCompany.id === seedCompanyId);
                  name = sc ? sc.name : '';
                  seedCompanyName === ''
                    ? (seedCompanyName += name)
                    : (seedCompanyName = seedCompanyName + ', ' + name);
                });
              return (
                <Grid
                  item
                  key={method.id}
                  xs={12}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <p className={classes.gridItemWidth1}>{method.name}</p>
                  <p className={classes.gridItemWidth3}>{seedCompanyName}</p>
                  <p className={classes.gridItemWidth3}>{companyName}</p>
                  <p className={classes.gridItemWidth2}>
                    {method.interestMethod === 'compound' ? 'Compound' : 'Fixed fees'}
                  </p>
                  <p className={classes.gridItemWidth2}>
                    {method.interestMethod === 'compound' ? `${method.interestRate}%` : `$${method.interestRate}`}
                  </p>

                  <IconButton onClick={() => this.handleEditFinanceDialogOpen(method)}>
                    <EditIcon style={{ color: 'green' }} />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      this.deleteFinanceMethod(method);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              );
            })}
          </CardBody>
        </Card>

        <Card className={classes.cardstyles}>
          <CardHeader>
            <div className={classes.actionBarStyles}>
              <p className={classes.cardHeader}>Delay adding products</p>

              <Button color="primary" className={classes.editButton} onClick={this.handleAddDelayDialogOpen}>
                ADD
              </Button>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <Grid container>
              <Grid item xs={1}>
                <p className={classes.tableHeader}>Name</p>
              </Grid>
              <Grid item xs={3}>
                <p className={classes.tableHeader}>Seed Companiness</p>
              </Grid>
              <Grid item xs={3}>
                <p className={classes.tableHeader}>Companiness</p>
              </Grid>
              <Grid item xs={2}>
                <p className={classes.tableHeader}>Delay till</p>
              </Grid>
              <Grid item xs={3} />
            </Grid>
            {delayProducts.map((delay) => {
              let companyName = '';
              let seedCompanyName = '';
              delay.companyIds &&
                delay.companyIds.forEach((companyId) => {
                  let company = companies.find((company) => company.id === companyId);
                  if (company) {
                    companyName === ''
                      ? (companyName += company.name)
                      : (companyName = companyName + ', ' + company.name);
                  }
                });
              delay.seedCompanyIds &&
                delay.seedCompanyIds.forEach((seedCompanyId) => {
                  let seedCompany = seedCompanies.find((seedCompany) => seedCompany.id === seedCompanyId);
                  if (seedCompany) {
                    seedCompanyName === ''
                      ? (seedCompanyName += seedCompany.name)
                      : (seedCompanyName = seedCompanyName + ', ' + seedCompany.name);
                  }
                });
              return (
                <Grid
                  item
                  key={delay.id}
                  xs={12}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <p className={classes.gridItemWidth1}>{delay.name}</p>
                  <p className={classes.gridItemWidth3}>{seedCompanyName}</p>
                  <p className={classes.gridItemWidth3}>{companyName}</p>
                  <p className={classes.gridItemWidth2}>
                    {delay.delayMethod === 'fixed'
                      ? format(delay.fixedDate, 'MM/DD/YYYY')
                      : `${delay.certainDays} days after order`}
                  </p>
                  <div className={classes.gridItemWidth2}></div>
                  <IconButton onClick={() => this.handleEditdDelayDialogOpen(delay)}>
                    <EditIcon style={{ color: 'green' }} />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      this.deleteDelayProduct(delay);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              );
            })}
          </CardBody>
        </Card>
        {addFinanceOpen && (
          <AddFinanceMethodDialog
            open={addFinanceOpen}
            onClose={this.handleAddFinanceDialogClose}
            loadDatas={this.loadDatas}
            financeMethods={financeMethods}
          />
        )}
        {editFinaceOpen && (
          <EditFinanceMethodDialog
            open={editFinaceOpen}
            onClose={this.handleEditFinanceDialogClose}
            financeMethod={activeFinanceItem}
            loadDatas={this.loadDatas}
            financeMethods={financeMethods}
          />
        )}
        {addDelayOpen && (
          <AddDelayDialog
            open={addDelayOpen}
            onClose={this.handleAddDelayDialogClose}
            loadDatas={this.loadDatas}
            delayProducts={delayProducts}
          />
        )}
        {editDelayOpen && (
          <EditDelayDialog
            open={editDelayOpen}
            onClose={this.handleEditDelayDialogClose}
            delayProduct={activeDelayItem}
            delayProducts={delayProducts}
            loadDatas={this.loadDatas}
          />
        )}
        {deleteFinanceMethodConfirm}
        {deleteDelayProductsConfirm}
      </div>
    );
  }
}

export default withStyles(statementSettingStyles)(StatementSetting);
