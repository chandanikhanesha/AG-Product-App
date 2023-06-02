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

import { customerReportStyles } from './customerReportstyles';
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
class customerReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allCustomerData: [],
      growerName: [],
      replant: ['All', 'true', 'false'],
      growerField: [],
      moreFuncMenuOpen: false,
    };
  }

  componentDidMount = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data) {
          try {
            !localStorage.getItem('AllCustomersData') &&
              localStorage.setItem('AllCustomersData', JSON.stringify(response.data));
            const cust = response.data.customersdata;
            this.setState({ allCustomerData: cust });
            let growerdata = [];
            let data = [];
            await uniqBy(this.state.allCustomerData, 'name').map((c) => growerdata.push(c.name));
            await this.customerCsvHeaders.map((g) => data.push(g));
            this.setState({
              growerName: uniq(growerdata.concat('All')) || [],
              growerField: data.concat('All'),
            });
          } catch (e) {
            console.log(e);
          }
        }
      });
    await this.props.listDeliveryReceipts();
  };
  handleChange = async (event, name, reportName) => {
    let data = [];
    const {
      target: { value, checked },
    } = event;

    // for acompare actual data lenght and when click on All set All data
    if (name === 'growerName') {
      await this.state.allCustomerData.map((ac) => data.push(ac.name));
    } else {
      await this.customerCsvHeaders.map((g) => data.push(g));
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
  handleMoreFuncMenuClose = (event) => {
    this.setState({ moreFuncMenuOpen: false });
  };
  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
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
      width: 160,

      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'cellPhoneNumber',
      accessor: 'cellPhoneNumber',
      width: 150,

      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'deliveryAddress',
      accessor: 'deliveryAddress',
      width: 150,

      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'businessStreet',
      accessor: 'businessStreet',
      width: 140,

      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'businessCity',
      accessor: 'businessCity',
      width: 120,

      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'businessState',
      accessor: 'businessState',
      width: 120,

      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
    {
      Header: 'businessZip',
      accessor: 'businessZip',
      width: 120,

      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },

    {
      Header: 'monsantoTechnologyId',
      width: 180,
      accessor: 'monsantoTechnologyId',

      headerStyle: {
        fontSize: '15px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      },
    },
  ];
  customerCsvHeaders = [
    'Name',
    'Email',
    'OfficePhoneNumber',
    'CellPhoneNumber',
    'DeliveryAddress',
    'BusinessStreet',
    'BusinessCity',
    'BusinessState',
    'BusinessZip',
    'MonsantoTechnologyId',

    // 'Notes',
  ];

  print = async () => {
    setTimeout(() => {
      const tempTitle = document.title;
      document.title = 'Delivery Invoice';
      window.print();
      document.title = tempTitle;
      this.setState({ isPrinting: false });
    }, 500);
  };
  render() {
    const { classes, organizationId } = this.props;
    const { allCustomerData, growerName, replant, growerField, moreFuncMenuOpen } = this.state;

    if (allCustomerData.length < 0) {
      return <CircularProgress />;
    }

    let finalData = [];
    let finalHeader = [];
    let filterHeader = [];
    let filterdata = [];

    growerName.map((g) => allCustomerData.filter((ad) => ad.name === g).map((ss) => filterdata.push(ss)));

    finalData = filterdata || [];

    let csvHeaders = [];

    this.customerCsvHeaders.map((s) => {
      csvHeaders.push({
        label: s,
        key: s.charAt(0).toLowerCase() + s.slice(1),
      });
    });

    growerField.map((g) =>
      this.customerHeader.filter((ad) => ad.Header.toLowerCase() === g.toLowerCase()).map((ss) => finalHeader.push(ss)),
    );
    growerField.map((g) =>
      csvHeaders.filter((ad) => ad.label.toLowerCase() === g.toLowerCase()).map((ss) => filterHeader.push(ss)),
    );

    return (
      <div>
        <h3 className={classes.cardIconTitle}> Customer Report</h3>

        <Card>
          <CardBody className={classes.cardBody}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <FormControl style={{ maxWidth: '200px', minWidth: '160px', marginRight: '20px' }}>
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

                    {uniqBy(allCustomerData, 'name').map((g) => (
                      <MenuItem key={g.name} value={g.name}>
                        <Checkbox checked={growerName.indexOf(g.name) > -1} />
                        <ListItemText primary={g.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                    {this.customerCsvHeaders.length > 0 && (
                      <MenuItem key={'All'} value={'All'}>
                        <Checkbox checked={growerField.indexOf('All') > -1} />
                        <ListItemText primary={'All'} />
                      </MenuItem>
                    )}
                    {this.customerCsvHeaders.length > 0 &&
                      this.customerCsvHeaders.map((name) => (
                        <MenuItem key={name} value={name}>
                          <Checkbox checked={growerField.indexOf(name) > -1} />
                          <ListItemText primary={name} />
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
            <div id="customerTable">
              {allCustomerData.length > 0 ? (
                <ReactTable
                  data={finalData}
                  columns={finalHeader}
                  minRows={1}
                  showPagination={true}
                  LoadingComponent={Loading}
                  loading={true}
                  // pageSize={finalData.length}
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
                  data={finalData || []}
                  style={{ color: '#2F2E2E', width: '170px' }}
                  filename={'customer.csv'}
                  headers={filterHeader}
                >
                  <span>Download CSV</span>
                </CSVLink>
              </MenuItem>
              <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  this.props.history.push({
                    pathname: `/app/bayer_orders_preview/customerReport`,
                    state: { data: finalData, header: finalHeader },
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

export default withStyles(customerReportStyles)(customerReport);
