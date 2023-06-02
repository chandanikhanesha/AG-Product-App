import React, { Component } from 'react';
import { Grid, withStyles } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import ReactTable from 'react-table';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
import Input from '@material-ui/core/Input';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Tooltip from '@material-ui/core/Tooltip';

// material dashboard components
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import { numberToDollars } from '../../../utilities';
import moment from 'moment';
import Creatable from 'react-select/creatable';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

import InputAdornment from '@material-ui/core/InputAdornment';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';

// icons
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

// material ui components
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import { uniqBy } from 'lodash';
import { Checkbox, FormControlLabel } from '@material-ui/core';

import { paymentDialogStyles } from './payment_dialog.styles';

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      required={true}
      className={props.selectProps.classes.textField}
      InputProps={{
        inputComponent,
        inputProps: {
          required: true,
          className: props.selectProps.classes.input,

          inputRef: props.innerRef,

          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Placeholder(props) {
  return (
    <Typography color="textSecondary" className={props.selectProps.classes.placeholder} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return (
    <div className={props.selectProps.classes.valueContainer} id="hellllo">
      {props.children}
    </div>
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      value={props.data.value}
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}
const components = {
  Control,
  Menu,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

const selectStyles = {
  input: (base) => ({
    ...base,
    '& input': {
      font: 'inherit',
    },
  }),

  menu: (styles) => ({ ...styles, zIndex: '1000 !important' }),
  paper: (styles) => ({ ...styles, zIndex: '1000 !important' }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

class PaymentDialog extends Component {
  state = {
    shareholderId: 'All', // 0: is for customer
    amount: 0.0,
    paymentDate: new Date(),
    method: 'Check',
    note: '',
    payBy: '',
    selectedCompanies: '',
    companyId: '',
    companyType: '',
    noPaymentCompany: [],
    sameNote: '',
    sameDate: new Date(),
    selectedShareholder: 'all',
    addPreviousData: [],
    orignalPreviousData: [],
    editPreviousData: [],
    editPayment: [],
    amountData: [],
    moreFuncMenuOpen: false,
    activeProductItem: null,
    anchorEl: null,
  };

  componentDidMount() {
    const { editingPayment, compainesMenuList, tableDatas } = this.props;

    const alredyCompanyId = compainesMenuList && compainesMenuList.length == 1 ? compainesMenuList[0].companyId : '';
    const paymentArray = tableDatas[0].allPayments
      .filter((c) => c.companyId !== null)
      .filter((p) => p.companyType == 'previousBalance');

    this.setState({
      selectedCompanies: alredyCompanyId,
      companyId: alredyCompanyId,
      companyType: compainesMenuList && compainesMenuList.length == 1 ? compainesMenuList[0].companyType : '',
      allCompanys: tableDatas[0].allCompanys,

      editPreviousData: paymentArray.map((u) =>
        Object.assign({}, u, { isEdit: false, showCheckBox: false, isShowRow: false }),
      ),
      editPayment: tableDatas[0].allPayments.map((u) =>
        Object.assign({}, u, { isEdit: false, showCheckBox: false, isShowRow: false }),
      ),
    });

    if (this.props.paymentDialogType == 1) {
      tableDatas[0].allCompanys !== undefined &&
        tableDatas[0].allCompanys.map((order) => {
          setTimeout(() => {
            const payment = tableDatas[0].allPayments.filter((d) => d.companyId == order.companyId);

            if (payment.length == 0) {
              this.addNewRow(order);
            }
          }, 500);
        });
    }
    // else if (
    //   tableDatas[0].allPayments
    //     .map((u) => Object.assign({}, u, { isEdit: false, isShowRow: false }))
    //     .filter((p) => p.companyId !== null && p.companyType !== 'previousBalance').length == 0
    // ) {
    //   this.addNewRow({
    //     amount: 0,
    //     paymentDate: new Date(),
    //     note: '',
    //     companyId: 0,
    //     companyType: '',

    //     id: this.state.noPaymentCompany.length + 1,
    //     method: 'Check',
    //     payBy: '',
    //     shareholderId: 0,
    //     isShow: true,
    //     multiCompanyData: [],
    //   });
    // }

    if (!editingPayment) return;

    const { shareholderId, amount, paymentDate, method, note, payBy, companyId, companyType } = editingPayment;

    this.setState({
      shareholderId,
      amount,
      paymentDate,
      method,
      note,
      payBy,
      selectedCompanies: companyId,
      companyId,
      companyType,
    });
  }

  handleMoreFuncMenuToggle = (item) => (event) => {
    this.setState({
      anchorEl: event.target,
      activeProductItem: item,
      moreFuncMenuOpen: !this.state.moreFuncMenuOpen,
    });
  };

  handleMoreFuncMenuClose = (event) => {
    this.setState({ moreFuncMenuOpen: false, activeProductItem: null, anchorEl: null });
  };

  componentDidUpdate() {
    const paymentArray = this.props.tableDatas[0].allPayments
      .filter((c) => c.companyId !== null)
      .filter((p) => p.companyType == 'previousBalance');
    if (
      paymentArray.length !== this.state.editPreviousData.length ||
      this.props.tableDatas[0].allPayments.length !== this.state.editPayment.length
    ) {
      this.setState({
        editPreviousData: paymentArray.map((u) =>
          Object.assign({}, u, { isEdit: false, showCheckBox: false, isShowRow: false }),
        ),
        editPayment: this.props.tableDatas[0].allPayments.map((u) =>
          Object.assign({}, u, { isEdit: false, showCheckBox: false, isShowRow: false }),
        ),
      });
    }
  }
  componentWillUnmount() {
    this.setState({
      shareholderId: 0, // 0: is for customer
      amount: 0.0,
      paymentDate: new Date(),
      method: 'Check',
      note: '',
      payBy: '',
      selectedCompanies: '',
      companyId: '',
      companyType: '',
    });
  }

  submit = () => {
    const { shareholderId, amount, paymentDate, method, note, payBy, companyId, companyType, noPaymentCompany } =
      this.state;
    const { editingPayment } = this.props;
    let data = { amount, paymentDate, method, note, payBy, companyId, companyType };
    if (!isNaN(shareholderId)) data.shareholderId = shareholderId;

    if (editingPayment) {
      this.props.updatePayment(data);
    } else {
      this.props.createPayment(data);
    }

    this.setState({
      shareholderId: 0,
      amount: 0.0,
      paymentDate: new Date(),
      method: 'Check',
      note: '',
      payBy: '',
    });
  };

  onSelectShareholderChange = async (shareholderId) => {
    const { shareholders, currentPurchaseOrder } = this.props;
    let selectedShareholder;
    if (shareholderId == 'all') {
      selectedShareholder = 'all';
    } else if (shareholderId === 'theCustomer') {
      selectedShareholder = { id: 'theCustomer' };
    } else {
      selectedShareholder = shareholders.find((shareholder) => shareholder.id === shareholderId);
    }
    this.setState({
      shareholderId,
      selectedShareholder: selectedShareholder,
    });
  };

  onSelectMethodChange = (method) => {
    this.setState({
      method,
    });
  };

  addNewRow = (order) => {
    this.setState({
      noPaymentCompany: [
        ...this.state.noPaymentCompany,
        {
          amount: 0,
          paymentDate: new Date(),
          note: '',
          companyId: 0,
          companyType: null,

          id: this.state.noPaymentCompany.length + 1,
          method: 'Check',
          payBy: '',
          shareholderId: 0,
          isShow: true,
          multiCompanyData: [],
        },
      ],
    });
  };

  createPayment = async (paymentId, name) => {
    const data = this.state[name].find((data) => data.id == paymentId);
    delete data.id;
    data.companyId = 0;
    await this.props.createPayment(this.props.currentPurchaseOrder.id, data);
    await this.props.refreshpayment().then((res) => {
      this.setState({ [name]: this.state[name].filter((d) => d.hasOwnProperty('id')) });
    });
  };

  handleChange = (name, value, payment, c) => {
    const data = this.state.noPaymentCompany;

    const index = data.findIndex((n) => n.id == payment.id);

    if (name == 'note') {
      const findNote = this.props.tableDatas[0].allPayments.filter((d) => d.note == value);

      if (findNote.length > 0) {
        data[index]['paymentDate'] = findNote[0].paymentDate;
      }
    }

    if (name == 'multiAmount' || name == 'multiNote') {
      const findCompanyIndex = data[index]['multiCompanyData'].findIndex(
        (cc) => cc.companyId == (c ? c.companyId : 99999) && cc.companyName == (c ? c.productType : 'PreviousBalance'),
      );
      const multiData = data[index]['multiCompanyData'];

      if (findCompanyIndex !== false && findCompanyIndex !== -1) {
        multiData[findCompanyIndex][name == 'multiAmount' ? 'amount' : name] = value;
      } else {
        data[index]['multiCompanyData'] = [
          ...data[index]['multiCompanyData'],
          {
            companyId: c ? c.companyId : 99999,
            companyName: c ? c.productType : 'PreviousBalance',

            amount:
              name == 'multiAmount'
                ? value
                : multiData[findCompanyIndex] && multiData[findCompanyIndex]['amount']
                ? multiData[findCompanyIndex]['amount']
                : 0,
            multiNote:
              name == 'multiAmount'
                ? multiData[findCompanyIndex] && multiData[findCompanyIndex]['multiNote']
                  ? multiData[findCompanyIndex]['multiNote']
                  : ''
                : value,
          },
        ];
      }
    } else {
      data[index][name] = value;
    }

    this.setState({ noPaymentCompany: data });
  };
  handlePreviousChange = (name, value, payment) => {
    const data = this.state.addPreviousData;

    const index = data.findIndex((n) => n.id == payment.id);

    data[index][name] = value;

    this.setState({ addPreviousData: data });
  };

  handleEditPreviousChange = (name, value, payment) => {
    const data = this.state.editPreviousData;

    const index = data.findIndex((n) => n.id == payment.id);

    data[index][name] = value;
    data[index]['isEdit'] = true;

    this.setState({ editPreviousData: data });
  };

  handleEditPaymentChange = (name, value, payment, c) => {
    const data = this.state.editPayment;

    const index = data.findIndex((n) => n.id == payment.id);
    if (name == 'note') {
      const findNote = this.props.tableDatas[0].allPayments.filter((d) => d.note == value);

      if (findNote.length > 0) {
        data[index]['paymentDate'] = findNote[0].paymentDate;
      }
    }

    if (name == 'multiAmount' || name == 'multiNote') {
      const findCompanyIndex =
        data[index] &&
        data[index]['multiCompanyData'].findIndex(
          (cc) =>
            cc.companyId == (c ? c.companyId : 99999) && cc.companyName == (c ? c.productType : 'PreviousBalance'),
        );
      const multiData = data[index]['multiCompanyData'];

      if (findCompanyIndex !== false && findCompanyIndex !== -1) {
        multiData[findCompanyIndex][name == 'multiAmount' ? 'amount' : name] = value;
      } else {
        data[index]['multiCompanyData'] = [
          ...data[index]['multiCompanyData'],
          {
            companyId: c ? c.companyId : 99999,
            amount:
              name == 'multiAmount'
                ? value
                : multiData[findCompanyIndex] && multiData[findCompanyIndex]['amount']
                ? multiData[findCompanyIndex]['amount']
                : 0,
            companyName: c ? c.productType : 'PreviousBalance',

            multiNote:
              name == 'multiAmount'
                ? multiData[findCompanyIndex] && multiData[findCompanyIndex]['multiNote']
                  ? multiData[findCompanyIndex]['multiNote']
                  : ''
                : value,
          },
        ];
      }
    } else {
      data[index][name] = value;
    }
    data[index]['isEdit'] = true;
    this.setState({ editPayment: data });
  };

  render() {
    const {
      open,
      onClose,
      shareholders,
      editingPayment,
      classes,
      customer,
      tableDatas,
      dealerDiscounts,
      compainesMenuList,
      currentPurchaseOrder,
      refreshpayment,
      deletePayment,
    } = this.props;
    const {
      noPaymentCompany,
      anchorEl,
      editPreviousData,
      editPayment,
      allCompanys,
      moreFuncMenuOpen,
      activeProductItem,
    } = this.state;
    let totalBalanceDue = 0;
    let totalPayment = 0;

    tableDatas.length > 0 &&
      tableDatas[0].allCompanys &&
      tableDatas[0].allCompanys.map((d) => (totalBalanceDue += parseFloat(d.total)));

    tableDatas.length > 0 &&
      tableDatas[0].allPayments &&
      tableDatas[0].allPayments
        // .filter((p) => p.companyId !== null)
        .map((p) => {
          return this.props.paymentDialogType == 2
            ? p.multiCompanyData.length > 0
              ? p.multiCompanyData.filter((m) => (totalPayment += parseFloat(m.amount || 0)))
              : (totalPayment += parseFloat(p.amount || 0))
            : (totalPayment += parseFloat(p.amount || 0));
        });
    let helper = {};
    const groupNote = [];
    tableDatas.length > 0 &&
      tableDatas[0].allPayments
        .filter((c) => c.companyId !== null && c.companyType == '')
        .reduce(function (r2, o2) {
          const key = o2.note;

          if (!helper[key]) {
            helper[key] = Object.assign({}, o2); // create a copy of o
            groupNote.push(helper[key]);
          } else {
            helper[key].amount = parseFloat(helper[key].amount) + parseFloat(o2.amount);
          }

          return r2;
        }, {});
    const orignalPreviousData =
      tableDatas.length > 0 &&
      tableDatas[0].allPayments
        .filter((c) => c.companyId !== null)
        .filter((p) => p.companyType != 'previousBalance')
        .slice();
    const options = [];
    tableDatas.length > 0 &&
      tableDatas[0].allPayments.length > 0 &&
      tableDatas[0].allPayments
        .filter((pp) => pp.note !== '')
        .map((pp) => {
          options.push({
            label: pp.note,
            value: pp.note,
          });
        });

    return this.props.paymentDialogType == 1 ? (
      <Dialog
        open={open}
        fullWidth
        maxWidth={currentPurchaseOrder.isSimple ? 'lg' : 'xl'}
        style={{ padding: '10px 20px' }}
      >
        <DialogTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              <b>Payment</b>
            </span>

            <Button
              id="addRow"
              className={classes.addNewMenuItem}
              style={{ backgroundColor: 'black', color: 'white', fontFamily: 'none' }}
              onClick={async () => {
                this.setState({
                  addPreviousData: [
                    ...this.state.addPreviousData,
                    {
                      amount: 0,
                      paymentDate: new Date(),
                      note: '',
                      companyId: 99999,
                      companyType: 'previousBalance',
                      id: this.state.addPreviousData.length + 1,
                      method: 'Check',
                      payBy: '',
                      shareholderId: 0,
                    },
                  ],
                });
              }}
            >
              Add Previous Balance
            </Button>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <ReactTable
            data={tableDatas[0].allCompanys}
            columns={[
              {
                Header: '',
                width: 140,
                accessor: (d) => d,
                sortMethod: (a, b) => {
                  return parseFloat(a) - parseFloat(b);
                },
                id: 'add',
                sortable: true,

                Cell: (props) => {
                  const order = props.value;

                  return (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                      <a style={{ color: '#2c7841' }} onClick={() => this.addNewRow(order)}>
                        Add Payment Row
                      </a>
                    </div>
                  );
                },
              },
              {
                Header: 'CompanyName',

                accessor: (d) => d,
                sortMethod: (a, b) => {
                  return parseFloat(a) - parseFloat(b);
                },
                id: 'CompanyName',
                sortable: true,

                Cell: (props) => {
                  const order = props.value;

                  return <div>{order.CompanyName}</div>;
                },
              },
              {
                Header: 'BalanceDue',

                accessor: (d) => d,
                sortMethod: (a, b) => {
                  return parseFloat(a) - parseFloat(b);
                },
                id: 'BalanceDue',
                sortable: true,

                Cell: (props) => {
                  const order = props.value;
                  return numberToDollars(order.total);
                },
              },
              {
                Header: 'ShareHolderBalanceDue',
                show: currentPurchaseOrder.isSimple ? false : true,

                accessor: (d) => d,
                sortMethod: (a, b) => {
                  return parseFloat(a) - parseFloat(b);
                },
                id: 'ShareHolderBalanceDue',
                sortable: true,

                Cell: (props) => {
                  const order = props.value;
                  let data = order;
                  const payment = tableDatas[0].allPayments.filter((d) => d.companyId == order.companyId);
                  let allShareHolder = [];
                  payment.length > 0 &&
                    payment.map((p) => {
                      const isShareHolderMatch = order.shareholderData.filter(
                        (s) =>
                          s.shareholderId == (p.shareholderId == 0 ? 'theCustomer' : p.shareholderId) &&
                          s.percentage !== 0,
                      );

                      if (isShareHolderMatch.length == 0) {
                        data = { ...data, total: 0 };
                      } else if (isShareHolderMatch.length > 0 && isShareHolderMatch[0].percentage) {
                        data = {
                          ...data,
                          total: (parseFloat(order.total) * isShareHolderMatch[0].percentage) / 100,
                        };
                      }

                      allShareHolder.push({
                        total: data.total,
                        shareholderId: p.shareholderId == 0 ? 'theCustomer' : p.shareholderId,
                        id: p.id,
                      });
                    });

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {allShareHolder.map((p) => {
                        return (
                          <div
                            style={{
                              paddingBottom: '20px',
                              background: editingPayment !== null && editingPayment.id == p.id ? '#ede8a69e' : '',
                            }}
                          >
                            <FormControl style={{ width: '60%' }}>
                              <TextField
                                inputProps={{
                                  // type: 'number',
                                  defaultValue: numberToDollars(p.total),
                                  // onChange: (e) => this.handleEditPaymentChange('amount', e.target.value, p),
                                  disabled: editingPayment !== null && editingPayment.id == p.id ? false : true,
                                }}
                              />
                            </FormControl>
                          </div>
                        );
                      })}
                    </div>
                  );
                },
              },
              {
                Header: 'PaymentAmount',
                width: 200,
                accessor: (d) => d,
                sortMethod: (a, b) => {
                  return parseFloat(a) - parseFloat(b);
                },
                id: 'PaymentAmount',
                sortable: true,

                Cell: (props) => {
                  const order = props.value;
                  let totalpayment = 0;
                  const payment = this.state.editPayment.filter((d) => d.companyId == order.companyId);
                  const options = [];
                  tableDatas[0].allPayments.map((pp) => {
                    options.push({
                      label: pp.amount,
                      value: pp.amount,
                    });
                  });
                  return (
                    <div>
                      {payment.length > 0 &&
                        payment.map((p) => (
                          <div
                            style={{
                              paddingBottom: '20px',
                              background: editingPayment !== null && editingPayment.id == p.id ? '#ede8a69e' : '',
                            }}
                          >
                            <FormControl style={{ width: '60%' }}>
                              <TextField
                                id="amount"
                                InputProps={{
                                  // type: 'number',
                                  defaultValue: numberToDollars(p.amount),

                                  onChange: (e) => this.handleEditPaymentChange('amount', e.target.value, p),
                                  // disabled: editingPayment !== null && editingPayment.id == p.id ? false : true,
                                  inputProps: {
                                    className: classes.input,
                                  },
                                }}
                              />
                            </FormControl>
                          </div>
                        ))}
                      {noPaymentCompany
                        .filter((p) => p.companyId == order.companyId)
                        .map((p) => (
                          <div style={{ paddingBottom: '20px', display: 'flex', alignItems: 'flex-end' }}>
                            <FormControl style={{ width: '60%' }}>
                              <TextField
                                id="amount"
                                inputProps={{
                                  type: 'number',
                                  value: p.amount,
                                  onChange: (e) => this.handleChange('amount', e.target.value, p),
                                  step: 0.1,
                                  min: 0,
                                }}
                              />
                            </FormControl>
                            <a
                              style={{ marginLeft: '10px', cursor: 'pointer' }}
                              onClick={() => this.handleChange('amount', order.total, p)}
                            >
                              FillBalance
                            </a>
                          </div>
                        ))}
                    </div>
                  );
                },
              },

              {
                Header: 'Check Date',
                width: 150,

                accessor: (d) => d,
                sortMethod: (a, b) => {
                  return parseFloat(a) - parseFloat(b);
                },
                id: 'Check Date',
                sortable: true,

                Cell: (props) => {
                  const order = props.value;

                  const payment = this.state.editPayment.filter((d) => d.companyId == order.companyId);

                  return (
                    <div>
                      {payment.length > 0 &&
                        payment.map((pp) => (
                          <div
                            style={{
                              paddingBottom: '20px',
                              background: editingPayment !== null && editingPayment.id == pp.id ? '#ede8a69e' : '',
                            }}
                          >
                            <DatePicker
                              leftArrowIcon={<NavigateBefore />}
                              rightArrowIcon={<NavigateNext />}
                              format="MM/DD/YYYY"
                              emptyLabel="Date"
                              value={moment.utc(pp.paymentDate).format('MM/DD/YYYY')}
                              onChange={(e) =>
                                this.handleEditPaymentChange(
                                  'paymentDate',
                                  moment.utc(e._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                                  pp,
                                )
                              }
                            />
                          </div>
                        ))}

                      {noPaymentCompany
                        .filter((p) => p.companyId == order.companyId)
                        .map((pp) => (
                          <div style={{ paddingBottom: '20px' }}>
                            <DatePicker
                              leftArrowIcon={<NavigateBefore />}
                              rightArrowIcon={<NavigateNext />}
                              format="MM/DD/YYYY"
                              emptyLabel="Date"
                              value={moment.utc(pp.paymentDate)}
                              onChange={(e) =>
                                this.handleChange(
                                  'paymentDate',
                                  moment.utc(e._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                                  pp,
                                )
                              }
                            />
                          </div>
                        ))}
                    </div>
                  );
                },
              },
              {
                Header: 'Note/Check No.',
                width: 190,
                accessor: (d) => d,
                sortMethod: (a, b) => {
                  return parseFloat(a) - parseFloat(b);
                },
                id: 'Check No',
                sortable: true,

                Cell: (props) => {
                  const order = props.value;

                  const payment = this.state.editPayment.filter((d) => d.companyId == order.companyId);

                  return (
                    <div>
                      {payment.length > 0 &&
                        payment.map((pp) => (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              // marginBottom: '20px',
                              background: editingPayment !== null && editingPayment.id == pp.id ? '#ede8a69e' : '',
                            }}
                          >
                            {' '}
                            <Creatable
                              backspaceRemovesValue={false}
                              isClearable={false}
                              classes={classes}
                              styles={selectStyles}
                              components={components}
                              onChange={(e) => {
                                e.value !== '' && this.handleEditPaymentChange('note', e.value, pp);
                              }}
                              onInputChange={(e) => {
                                e !== '' && this.handleEditPaymentChange('note', e, pp);
                              }}
                              style={{
                                background: editingPayment !== null && editingPayment.id == pp.id ? '#ede8a69e' : '',
                              }}
                              placeholder="Note"
                              options={uniqBy(options, 'value')}
                              isValidNewOption={() => true}
                              value={{ label: pp.note, value: pp.note }}
                              textFieldProps={{
                                id: 'note',
                                label: '',

                                InputLabelProps: {
                                  shrink: true,
                                },
                              }}
                              menuPortalTarget={document.body}
                              menuPosition={'absolute'}
                            />
                          </div>
                        ))}

                      {noPaymentCompany
                        .filter((p) => p.companyId == order.companyId)
                        .map((pp) => (
                          <div>
                            {' '}
                            {pp.isShow == true && (
                              <Creatable
                                backspaceRemovesValue={false}
                                isClearable={false}
                                classes={classes}
                                styles={selectStyles}
                                components={components}
                                onChange={(e) => {
                                  e.value !== '' && this.handleChange('note', e.value, pp);
                                }}
                                onInputChange={(e) => {
                                  e !== '' && this.handleChange('note', e, pp);
                                }}
                                placeholder="Note"
                                options={uniqBy(options, 'value')}
                                isValidNewOption={() => true}
                                value={{ label: pp.note, value: pp.note }}
                                textFieldProps={{
                                  id: 'note',
                                  label: '',

                                  InputLabelProps: {
                                    shrink: true,
                                  },
                                }}
                                menuPortalTarget={document.body}
                                menuPosition={'absolute'}
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  );
                },
              },

              {
                Header: 'ShareHolder',
                width: 230,
                accessor: (d) => d,
                sortMethod: (a, b) => {
                  return parseFloat(a) - parseFloat(b);
                },
                id: 'ShareHolder',
                sortable: true,
                show: currentPurchaseOrder.isSimple ? false : true,

                Cell: (props) => {
                  const order = props.value;

                  const payment = this.state.editPayment.filter((d) => d.companyId == order.companyId);
                  const options = [];
                  tableDatas[0].allPayments.map((pp) => {
                    options.push({
                      label: pp.note,
                      value: pp.note,
                    });
                  });
                  return (
                    <div>
                      {payment.length > 0 &&
                        payment.map((pp) => (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',

                              width: '80%',
                              background: editingPayment !== null && editingPayment.id == pp.id ? '#ede8a69e' : '',
                            }}
                          >
                            {' '}
                            <FormControl className={classes.select}>
                              <Select
                                id="shareholderChoose"
                                name="shareholder"
                                value={pp.shareholderId}
                                onChange={(e) => this.handleEditPaymentChange('shareholderId', e.target.value, pp)}

                                // disabled={editingPayment !== null && editingPayment.id == pp.id ? false : true}
                              >
                                <MenuItem value={0}>{customer.name}</MenuItem>
                                {shareholders
                                  .filter((c) => c.customerId == currentPurchaseOrder.customerId)
                                  .map((shareholder) => (
                                    <MenuItem value={shareholder.id} key={shareholder.id} id={shareholder.name}>
                                      {shareholder.name}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </div>
                        ))}

                      {noPaymentCompany
                        .filter((p) => p.companyId == order.companyId)
                        .map((pp) => (
                          <div
                            style={{
                              width: '80%',
                            }}
                          >
                            <FormControl className={classes.select}>
                              <Select
                                id="shareholderChoose"
                                name="shareholder"
                                value={pp.shareholderId}
                                onChange={(e) => this.handleChange('shareholderId', e.target.value, pp)}
                              >
                                <MenuItem value={0}>{customer.name}</MenuItem>
                                {shareholders
                                  .filter((c) => c.customerId == currentPurchaseOrder.customerId)
                                  .map((shareholder) => (
                                    <MenuItem value={shareholder.id} key={shareholder.id} id={shareholder.name}>
                                      {shareholder.name}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </div>
                        ))}
                    </div>
                  );
                },
              },
              {
                Header: 'PaymentMethod',
                width: 250,
                accessor: (d) => d,
                sortMethod: (a, b) => {
                  return parseFloat(a) - parseFloat(b);
                },
                id: 'PaymentMethod',
                sortable: true,
                headerStyle: {
                  textAlign: 'left',
                },

                Cell: (props) => {
                  const order = props.value;

                  const payment = this.state.editPayment.filter((d) => d.companyId == order.companyId);

                  return (
                    <div>
                      {payment.length > 0 &&
                        payment.map((pp) => (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              paddingBottom: '20px',
                              width: '100%',
                              justifyContent: 'space-between',
                              background: editingPayment !== null && editingPayment.id == pp.id ? '#ede8a69e' : '',
                            }}
                          >
                            {' '}
                            <FormControl style={{ width: '60%' }}>
                              <Select
                                name="method"
                                value={pp.method}
                                defaultValue={pp.method}
                                onChange={(e) => this.handleEditPaymentChange('method', e.target.value, pp)}

                                // disabled={editingPayment !== null && editingPayment.id == pp.id ? false : true}
                              >
                                {['Check', 'Cash', 'Return', 'Adjustment', 'JDF Financing'].map((method) => (
                                  <MenuItem value={method} key={method}>
                                    {method}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            {pp.isEdit == true && (
                              <div style={{ display: 'flex' }}>
                                <CheckIcon
                                  id="checkTransfer"
                                  onClick={async () => {
                                    delete pp.isEdit;
                                    await this.props.updatePaymentProps(currentPurchaseOrder.id, pp.id, pp);
                                    await this.props.refreshpayment();
                                  }}
                                  style={{ color: 'green' }}
                                />
                                <CloseIcon
                                  style={{ color: 'red' }}
                                  onClick={() => {
                                    this.setState({
                                      editPayment: tableDatas[0].allPayments.map((u) =>
                                        Object.assign({}, u, { isEdit: false }),
                                      ),
                                    });
                                  }}
                                />
                              </div>
                            )}
                            {this.state[`loading${pp.id}`] ? (
                              <CircularProgress
                                size={24}
                                style={{
                                  position: 'absolute',

                                  marginLeft: '200px',
                                }}
                              />
                            ) : (
                              <a
                                style={{ marginLeft: '10px', cursor: 'pointer' }}
                                onClick={async () => {
                                  this.setState({ [`loading${pp.id}`]: true });
                                  await deletePayment(currentPurchaseOrder.id, pp);
                                  await this.props.refreshpayment().then(() => {
                                    this.setState({ [`loading${pp.id}`]: false });
                                  });
                                }}
                              >
                                Delete
                              </a>
                            )}
                          </div>
                        ))}

                      {noPaymentCompany
                        .filter((p) => p.companyId == order.companyId)
                        .map((pp) => (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '20px',
                              width: '100%',
                              justifyContent: 'space-between',
                            }}
                          >
                            <FormControl style={{ width: '60%' }}>
                              <Select
                                name="method"
                                value={pp.method}
                                onChange={(e) => this.handleChange('method', e.target.value, pp)}
                              >
                                {['Check', 'Cash', 'Return', 'Adjustment', 'JDF Financing'].map((method) => (
                                  <MenuItem value={method} key={method}>
                                    {method}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            {!pp.hasOwnProperty('id') ? (
                              <CircularProgress
                                size={24}
                                style={{
                                  position: 'absolute',

                                  marginLeft: '200px',
                                }}
                              />
                            ) : (
                              <div style={{ display: 'flex' }}>
                                <CheckIcon
                                  id="checkTransfer"
                                  onClick={(e) => {
                                    this.createPayment(pp.id, 'noPaymentCompany');
                                    // console.log(p.id, 'p.id');
                                    // this.setState({
                                    //   noPaymentCompany: noPaymentCompany.filter((n) => n.id !== p.id),
                                    // });
                                  }}
                                  style={{ color: 'green' }}
                                />
                                <CloseIcon
                                  style={{ color: 'red' }}
                                  onClick={() => {
                                    this.setState({
                                      noPaymentCompany: noPaymentCompany.filter((n) => n.id !== pp.id),
                                    });
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  );
                },
              },
            ]}
            getTrProps={(state, rowInfo) => {
              let style = {};

              style = {
                borderBottom: '1px solid #00000033',
                marginBottom: '20px',
              };

              return {
                style,
              };
            }}
            sortable={false}
            showPagination={false}
            minRows={1}
            NoDataComponent={() => null}
          ></ReactTable>
          {(editPreviousData.length > 0 || this.state.addPreviousData.length > 0) && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>PreviousBalance</div>
              <div style={{ width: '80%' }}>
                {editPreviousData.map((p) => {
                  const isFind = orignalPreviousData.find((pp) => pp.id == p.id);

                  return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                        <TextField
                          label="PreviousBalanceAmount"
                          id="amount"
                          inputProps={{
                            type: 'number',
                            defaultValue: p.amount,
                            onChange: (e) => this.handleEditPreviousChange('amount', e.target.value, p),

                            step: 0.1,
                            min: 0,
                          }}
                        />
                      </FormControl>

                      <div style={{ width: '20%', marginRight: '30px' }}>
                        <DatePicker
                          leftArrowIcon={<NavigateBefore />}
                          rightArrowIcon={<NavigateNext />}
                          format="MM/DD/YYYY"
                          emptyLabel="Date"
                          value={moment.utc(p.paymentDate).format('MM/DD/YYYY')}
                          onChange={(e) =>
                            this.handleEditPreviousChange(
                              'paymentDate',
                              moment.utc(e._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                              p,
                            )
                          }
                        />
                      </div>
                      <div style={{ width: '15%', marginRight: '30px' }}>
                        <Creatable
                          backspaceRemovesValue={false}
                          isClearable={false}
                          classes={classes}
                          styles={selectStyles}
                          components={components}
                          onChange={(e) => {
                            e.value !== '' && this.handleEditPreviousChange('note', e.value, p);
                          }}
                          onInputChange={(e) => {
                            e !== '' && this.handleEditPreviousChange('note', e, p);
                          }}
                          placeholder="Note"
                          options={uniqBy(options, 'value')}
                          isValidNewOption={() => true}
                          value={{ label: p.note, value: p.note }}
                          textFieldProps={{
                            id: 'Note',
                            label: 'Note',
                            InputLabelProps: {
                              shrink: true,
                            },
                          }}
                          menuPortalTarget={document.body}
                          menuPosition={'absolute'}
                        />
                      </div>

                      <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                        <Select
                          id="shareholderChoose"
                          name="shareholder"
                          value={p.shareholderId}
                          onChange={(e) => this.handleEditPreviousChange('shareholderId', e.target.value, p)}

                          // disabled={editingPayment !== null && editingPayment.id == a.id ? false : true}
                        >
                          <MenuItem value={0}>{customer.name}</MenuItem>
                          {shareholders
                            .filter((c) => c.customerId == currentPurchaseOrder.customerId)
                            .map((shareholder) => (
                              <MenuItem value={shareholder.id} key={shareholder.id} id={shareholder.name}>
                                {shareholder.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                      <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                        <Select
                          name="method"
                          value={p.method}
                          defaultValue={p.method}
                          onChange={(e) => this.handleEditPreviousChange('method', e.target.value, p)}

                          // disabled={editingPayment !== null && editingPayment.id == pp.id ? false : true}
                        >
                          {['Check', 'Cash', 'Return', 'Adjustment', 'JDF Financing'].map((method) => (
                            <MenuItem value={method} key={method}>
                              {method}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {p.isEdit == true && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <CheckIcon
                            id="checkTransfer"
                            onClick={async () => {
                              delete p.isEdit;

                              await this.props.updatePaymentProps(currentPurchaseOrder.id, p.id, p);
                              await this.props.refreshpayment();
                            }}
                            style={{ color: 'green' }}
                          />
                          <CloseIcon
                            style={{ color: 'red' }}
                            onClick={() => {
                              this.setState({
                                editPreviousData: tableDatas[0].allPayments.map((u) =>
                                  Object.assign({}, u, { isEdit: false }),
                                ),
                              });
                            }}
                          />
                        </div>
                      )}
                      {this.state[`loading${p.id}`] ? (
                        <CircularProgress size={24} />
                      ) : (
                        <a
                          style={{ marginLeft: '10px', cursor: 'pointer' }}
                          onClick={async () => {
                            this.setState({ [`loading${p.id}`]: true });

                            await deletePayment(currentPurchaseOrder.id, p);
                            await this.props.refreshpayment().then(() => {
                              this.setState({ [`loading${p.id}`]: false });
                            });
                          }}
                        >
                          Delete
                        </a>
                      )}
                    </div>
                  );
                })}
                {this.state.addPreviousData.map((a) => {
                  return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                        <TextField
                          label="PreviousBalanceAmount"
                          id="amount"
                          inputProps={{
                            type: 'number',
                            defaultValue: a.amount,
                            onChange: (e) => this.handlePreviousChange('amount', e.target.value, a),

                            step: 0.1,
                            min: 0,
                          }}
                        />
                      </FormControl>
                      <div style={{ width: '20%', marginRight: '30px' }}>
                        <DatePicker
                          leftArrowIcon={<NavigateBefore />}
                          rightArrowIcon={<NavigateNext />}
                          format="MM/DD/YYYY"
                          emptyLabel="Date"
                          value={moment.utc(a.paymentDate).format('MM/DD/YYYY')}
                          onChange={(e) =>
                            this.handlePreviousChange(
                              'paymentDate',
                              moment.utc(e._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                              a,
                            )
                          }
                        />
                      </div>
                      <div style={{ width: '15%', marginRight: '30px' }}>
                        <Creatable
                          backspaceRemovesValue={false}
                          isClearable={false}
                          classes={classes}
                          styles={selectStyles}
                          components={components}
                          onChange={(e) => {
                            e.value !== '' && this.handlePreviousChange('note', e.value, a);
                          }}
                          onInputChange={(e) => {
                            e !== '' && this.handlePreviousChange('note', e, a);
                          }}
                          placeholder="Note"
                          options={uniqBy(options, 'value')}
                          isValidNewOption={() => true}
                          value={{ label: a.note, value: a.note }}
                          textFieldProps={{
                            id: 'Note',
                            label: 'Note',
                            InputLabelProps: {
                              shrink: true,
                            },
                          }}
                          menuPortalTarget={document.body}
                          menuPosition={'absolute'}
                        />
                      </div>
                      <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                        <Select
                          id="shareholderChoose"
                          name="shareholder"
                          value={a.shareholderId}
                          onChange={(e) => this.handlePreviousChange('shareholderId', e.target.value, a)}

                          // disabled={editingPayment !== null && editingPayment.id == a.id ? false : true}
                        >
                          <MenuItem value={0}>{customer.name}</MenuItem>
                          {shareholders
                            .filter((c) => c.customerId == currentPurchaseOrder.customerId)
                            .map((shareholder) => (
                              <MenuItem value={shareholder.id} key={shareholder.id} id={shareholder.name}>
                                {shareholder.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                      <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                        <Select
                          name="method"
                          value={a.method}
                          defaultValue={a.method}
                          onChange={(e) => this.handlePreviousChange('method', e.target.value, a)}

                          // disabled={editingPayment !== null && editingPayment.id == pp.id ? false : true}
                        >
                          {['Check', 'Cash', 'Return', 'Adjustment', 'JDF Financing'].map((method) => (
                            <MenuItem value={method} key={method}>
                              {method}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {!a.hasOwnProperty('id') ? (
                        <CircularProgress size={24} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <CheckIcon
                            id="checkTransfer"
                            onClick={async (e) => {
                              await this.createPayment(a.id, 'addPreviousData');
                            }}
                            style={{ color: 'green' }}
                          />
                          <CloseIcon
                            style={{ color: 'red' }}
                            onClick={() => {
                              this.setState({
                                addPreviousData: this.state.addPreviousData.filter((n) => n.id !== a.id),
                              });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={classes.finalrow}>
            <p>TotalBalanceDue : {numberToDollars(totalBalanceDue)} </p>
            <p style={{ marginLeft: '105px' }}>TotalPaymentAmount : {numberToDollars(totalPayment)}</p>{' '}
          </div>
          <div>
            {groupNote.length > 0 && (
              <ReactTable
                data={groupNote}
                columns={[
                  {
                    Header: 'Note',
                    headerStyle: {
                      color: '#3C4858',

                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      textAlign: 'left',
                    },
                    accessor: (d) => d,
                    sortMethod: (a, b) => {
                      return parseFloat(a) - parseFloat(b);
                    },
                    id: 'Note',
                    sortable: true,

                    Cell: (props) => {
                      const order = props.value;

                      return <div>{order.note || ''}</div>;
                    },
                  },
                  {
                    Header: 'Amount',
                    headerStyle: {
                      color: '#3C4858',

                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      textAlign: 'left',
                    },
                    accessor: (d) => d,
                    sortMethod: (a, b) => {
                      return parseFloat(a) - parseFloat(b);
                    },
                    id: 'Amount',
                    sortable: true,

                    Cell: (props) => {
                      const order = props.value;
                      return numberToDollars(order.amount);
                    },
                  },
                ]}
                sortable={false}
                showPagination={false}
                minRows={1}
              ></ReactTable>
            )}
          </div>
        </DialogContent>

        <DialogActions style={{ marginBottom: '20px' }}>
          <Button
            onClick={() => {
              this.setState({
                shareholderId: 0, // 0: is for customer
                amount: 0.0,
                paymentDate: new Date(),
                method: 'Check',
                note: '',
                payBy: '',
              });
              onClose();
            }}
            color="primary"
          >
            Close
          </Button>
          {/*editingPayment !== null && (
            <Button
              id="createPayment"
              onClick={this.submit}
              color="primary"
              disabled={selectedCompanies == '' ? true : false}
              className={classes.addButton}
              style={{ color: 'white', background: selectedCompanies != '' ? '#3EA55C' : '#999' }}
            >
              {editingPayment ? 'Update' : 'Create'}
            </Button>
          )*/}
        </DialogActions>
      </Dialog>
    ) : (
      <Dialog open={open} fullWidth maxWidth={'lg'} style={{ padding: '10px 20px' }}>
        <DialogContent style={{ padding: 0 }}>
          <div className={classes.dialogShadow}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', alignItems: 'center' }}>
              <h4 style={{ marginLeft: '20px', textTransform: 'uppercase', fontFamily: 'DM Sans', fontWeight: '400' }}>
                Payment
              </h4>
              <div>
                <Button
                  id="addPaymentRow"
                  style={{ color: '#2c7841', fontSize: '15px', marginRight: '50px' }}
                  onClick={() =>
                    this.addNewRow(
                      editPayment.filter((p) => p.companyId !== null && p.companyType !== 'previousBalance')[0],
                    )
                  }
                >
                  + Add Payment Row
                </Button>

                <IconButton
                  id="closePayment"
                  onClick={() => {
                    this.setState({
                      shareholderId: 0, // 0: is for customer
                      amount: 0.0,
                      paymentDate: new Date(),
                      method: 'Check',
                      note: '',
                      payBy: '',
                    });
                    onClose();
                  }}
                  style={{ color: '#9E9E9E' }}
                >
                  <CloseIcon />
                </IconButton>
              </div>
            </div>
          </div>

          {editPayment.length > 0 &&
            editPayment
              .filter(
                (p) =>
                  (p.companyId !== null && p.companyType !== 'previousBalance') ||
                  (p.companyId == null && p.companyType == null),
              )
              .map((p) => {
                let totalPayment = 0;
                p.multiCompanyData.length !== 0
                  ? p.multiCompanyData.map((p) => (totalPayment += parseFloat(p.amount)))
                  : (totalPayment = p.amount);

                const companyData =
                  p.method == 'Previous Balance' &&
                  p.multiCompanyData.filter((m) => m.companyId == 99999).length == 0 &&
                  allCompanys.filter((d) => d.companyId == 99999).length == 0
                    ? [...allCompanys, { CompanyName: 'Previous Balance', amount: 0, companyId: 99999 }]
                    : allCompanys;

                return (
                  <div
                    className={classes.dialogShadow}
                    style={{ display: 'flex', background: p.isShowRow ? '#E5E5E5' : 'white' }}
                  >
                    <div className={classes.lineBorder}>
                      {p.isShowRow == true ? (
                        <KeyboardArrowDownIcon
                          style={{ fontSize: '35px' }}
                          onClick={async () => {
                            const data = tableDatas[0].allPayments;

                            const index = data.findIndex((n) => n.id == p.id);
                            data[index]['isShowRow'] = false;

                            this.setState({ editPayment: data });
                            await this.props.refreshpayment();
                            // document.getElementById(`row-${p.id}`).style.display = 'none';
                          }}
                        />
                      ) : (
                        <KeyboardArrowRightIcon
                          style={{ fontSize: '35px' }}
                          onClick={async () => {
                            const data = tableDatas[0].allPayments;

                            const index = data.findIndex((n) => n.id == p.id);
                            data[index]['isShowRow'] = true;

                            this.setState({ editPayment: data });
                            await this.props.refreshpayment();
                          }}
                        />
                      )}
                    </div>
                    <div style={{ width: '100%', margin: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginRight: '25px' }}>
                        <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                          <InputLabel>PaymentMethod</InputLabel>
                          <Select
                            label="PaymentMethod"
                            name="method"
                            id={`PaymentMethod-${p.id}`}
                            value={p.method}
                            defaultValue={p.method}
                            disabled={!p.showEditCheckBox}
                            onChange={(e) => this.handleEditPaymentChange('method', e.target.value, p)}

                            // disabled={editingPayment !== null && editingPayment.id == pp.id ? false : true}
                          >
                            {['Check', 'Cash', 'Return', 'Adjustment', 'JDF Financing', 'Previous Balance'].map(
                              (method) => (
                                <MenuItem value={method} key={method}>
                                  {method}
                                </MenuItem>
                              ),
                            )}
                          </Select>
                        </FormControl>
                        {currentPurchaseOrder.isSimple !== true && (
                          <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                            <InputLabel id="ShareHolder">ShareHolder</InputLabel>

                            <Select
                              label="ShareHolder"
                              id="ShareHolder"
                              name="shareholder"
                              disabled={!p.showEditCheckBox}
                              value={p.shareholderId}
                              onChange={(e) => this.handleEditPaymentChange('shareholderId', e.target.value, p)}

                              // disabled={editingPayment !== null && editingPayment.id == a.id ? false : true}
                            >
                              <MenuItem value={0}>{customer.name}</MenuItem>
                              {shareholders
                                .filter((c) => c.customerId == currentPurchaseOrder.customerId)
                                .map((shareholder) => (
                                  <MenuItem value={shareholder.id} key={shareholder.id} id={shareholder.name}>
                                    {shareholder.name}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        )}
                        <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                          <TextField
                            label="CheckAmount"
                            id="amount"
                            disabled={!p.showEditCheckBox}
                            InputProps={{
                              type: 'number',
                              defaultValue: p.amount,

                              onChange: (e) => this.handleEditPaymentChange('amount', e.target.value, p),
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,

                              step: 0.1,

                              min: 0,
                            }}
                          />
                        </FormControl>
                        <div style={{ width: '20%', marginBottom: '20px' }}>
                          <DatePicker
                            leftArrowIcon={<NavigateBefore />}
                            rightArrowIcon={<NavigateNext />}
                            disabled={!p.showEditCheckBox}
                            format="MM/DD/YYYY"
                            emptyLabel="Date"
                            label="PaymentDate"
                            value={moment.utc(p.paymentDate).format('MM/DD/YYYY')}
                            onChange={(e) =>
                              this.handleEditPaymentChange(
                                'paymentDate',
                                moment.utc(e._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                                p,
                              )
                            }
                          />
                        </div>
                        <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                          <InputLabel htmlFor="Note" shrink>
                            Note
                          </InputLabel>
                          {p.isEdit !== true ? (
                            <Input
                              placeholder="Note"
                              disabled={!p.showEditCheckBox}
                              defaultValue={p.note}
                              // value={noteValue}
                              multiline
                              rows={1}
                              maxRows={3}
                              onChange={(e) => this.handleEditPaymentChange('note', e.target.value, p)}
                              type="text"
                              style={{ width: '120%' }}
                              name="Note"
                            />
                          ) : (
                            <Tooltip title={p.note}>
                              <Input
                                placeholder="Note"
                                disabled={!p.showEditCheckBox}
                                defaultValue={p.note}
                                // value={noteValue}

                                onChange={(e) => this.handleEditPaymentChange('note', e.target.value, p)}
                                type="text"
                                style={{ width: '120%' }}
                                name="Note"
                              />
                            </Tooltip>
                          )}
                        </FormControl>

                        <IconButton
                          aria-label="more"
                          onClick={this.handleMoreFuncMenuToggle(p)}
                          style={{ marginLeft: '35px' }}
                          id="paymentDot"
                        >
                          <MoreHorizontalIcon style={{ color: '9e9e9e' }} />
                        </IconButton>
                        <Popover
                          open={moreFuncMenuOpen}
                          anchorEl={anchorEl}
                          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                          onClose={this.handleMoreFuncMenuClose}
                        >
                          <Paper>
                            <MenuItem>
                              {activeProductItem !== null && (
                                <a
                                  style={{
                                    cursor: 'pointer',
                                    color: activeProductItem.isEdit == true ? '#9E9E9E' : '#9c27b0',
                                  }}
                                  onClick={async () => {
                                    this.handleEditPaymentChange('isShowRow', true, activeProductItem);

                                    this.handleEditPaymentChange('showEditCheckBox', true, activeProductItem);
                                  }}
                                >
                                  EDIT
                                </a>
                              )}
                            </MenuItem>
                            <MenuItem>
                              <a
                                style={{ cursor: 'pointer', color: '#9E9E9E' }}
                                onClick={async () => {
                                  await deletePayment(currentPurchaseOrder.id, activeProductItem);
                                  await this.props.refreshpayment();
                                }}
                              >
                                DELETE
                              </a>
                            </MenuItem>
                          </Paper>
                        </Popover>

                        {p.isEdit == true && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckIcon
                              id="checkTransfer"
                              onClick={async () => {
                                delete p.isEdit;
                                delete p.showEditCheckBox;
                                await this.props.updatePaymentProps(currentPurchaseOrder.id, p.id, p);
                                await this.setState({ allCompanys: allCompanys.filter((d) => d.companyId !== 99999) });

                                await this.props.refreshpayment();
                              }}
                              style={{ color: 'green' }}
                            />
                            <CloseIcon
                              style={{ color: 'red' }}
                              onClick={async () => {
                                const data = tableDatas[0].allPayments;

                                const index = data.findIndex((n) => n.id == p.id);
                                data[index]['isEdit'] = false;

                                this.setState({ editPayment: data });
                                await this.props.refreshpayment();
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {p.isShowRow && (
                        <div className={classes.subRowContainer}>
                          {companyData.length > 0 &&
                            companyData.map((c, i) => {
                              const isFind =
                                c.isPaymentData &&
                                c.isPaymentData.find(
                                  (d) => d.id == p.id && d.companyId == p.companyId && p.multiCompanyData.length > 0,
                                );

                              const multiCompanyAmount = p.multiCompanyData.find(
                                (d) => d.companyId == c.companyId && d.companyName == c.productType,
                              );

                              const isDisable = document.getElementById(
                                `isDisable-${p.id}-${c.companyId}-${c.CompanyName}`,
                              );

                              const currentBalnceDue = [
                                ...tableDatas[0].allBalanceDueData,
                                ...tableDatas[0].getRemainPaymentData,
                              ].filter((d) => d.productType == c.productType);

                              const currentDate = currentBalnceDue.find(
                                (d) => moment(d.earlyPayDeadLinedate).format() > moment(p.paymentDate).format(),
                              );

                              const currentBalnceDueBayer =
                                currentBalnceDue.length > 0 && currentBalnceDue[0].hasOwnProperty('preTotal')
                                  ? currentBalnceDue[0].total
                                  : moment.utc(p.paymentDate) == moment.utc(new Date())
                                  ? currentBalnceDue[currentBalnceDue.length - 1].finalBalanceDue
                                  : currentDate
                                  ? currentDate.finalBalanceDue
                                  : currentBalnceDue[0].finalBalanceDue;

                              const noteValue =
                                multiCompanyAmount !== undefined
                                  ? multiCompanyAmount.multiNote
                                  : isFind !== undefined
                                  ? isFind.note
                                  : '';

                              const companyAmount = multiCompanyAmount !== undefined ? multiCompanyAmount.amount : 0;
                              const isFieldDisable =
                                c.CompanyName == 'Previous Balance'
                                  ? false
                                  : isDisable !== null
                                  ? !isDisable.checked
                                  : companyAmount !== 0 && p.showEditCheckBox == true
                                  ? false
                                  : true;

                              return (
                                (parseInt(companyAmount) !== 0 || p.showEditCheckBox == true) && (
                                  <div className={classes.subRowData}>
                                    {p.showEditCheckBox == true && c.CompanyName !== 'Previous Balance' && (
                                      <div style={{ marginRight: '20px', marginTop: '-10px' }}>
                                        <FormControl>
                                          <Checkbox
                                            id={`isDisable-${p.id}-${c.companyId}-${c.CompanyName}`}
                                            color="primary"
                                            defaultChecked={companyAmount !== 0 ? true : false}
                                            onChange={(e) => {
                                              this.setState({ allCompanys: companyData });
                                            }}
                                          />
                                        </FormControl>
                                      </div>
                                    )}

                                    <div className={classes.companyName}>{c.CompanyName}</div>
                                    <div style={{ width: '200px' }}>
                                      {c.CompanyName !== 'Previous Balance' ? (
                                        <FormControl style={{ marginRight: '30px', marginBottom: '20px' }}>
                                          <InputLabel htmlFor="BalanceDue" shrink>
                                            Balance Due
                                          </InputLabel>
                                          <Input
                                            placeholder="Balance Due"
                                            disableUnderline={true}
                                            disabled={true}
                                            defaultValue={numberToDollars(currentBalnceDueBayer || 0)}
                                            value={numberToDollars(currentBalnceDueBayer || 0)}
                                            style={{ width: '90%' }}
                                            name="BalanceDue"
                                          />
                                        </FormControl>
                                      ) : (
                                        <FormControl
                                          style={{ width: '60%', marginRight: '30px', marginBottom: '20px' }}
                                        >
                                          <InputLabel htmlFor="Note" shrink>
                                            Note
                                          </InputLabel>
                                          <Input
                                            placeholder="Note"
                                            defaultValue={noteValue}
                                            value={noteValue}
                                            onChange={(e) =>
                                              this.handleEditPaymentChange('multiNote', e.target.value, p)
                                            }
                                            type="text"
                                            style={{ width: '90%' }}
                                            name="Note"
                                          />
                                        </FormControl>
                                      )}
                                    </div>
                                    <div>
                                      {' '}
                                      <div style={{ display: 'flex' }}>
                                        <FormControl style={{ marginRight: '30px', marginBottom: '20px' }}>
                                          <InputLabel htmlFor="Amount" shrink>
                                            Amount
                                          </InputLabel>
                                          <Input
                                            placeholder="Amount"
                                            disabled={isFieldDisable}
                                            disableUnderline={true}
                                            id={`${c.CompanyName}-amount`}
                                            type="number"
                                            name="Amount"
                                            defaultValue={companyAmount}
                                            value={companyAmount}
                                            onChange={(e) =>
                                              this.handleEditPaymentChange('multiAmount', e.target.value, p, c)
                                            }
                                            startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                          />
                                        </FormControl>

                                        <a
                                          style={{ marginLeft: '10px', cursor: 'pointer' }}
                                          onClick={() =>
                                            !isFieldDisable &&
                                            this.handleEditPaymentChange('multiAmount', currentBalnceDueBayer, p, c)
                                          }
                                        >
                                          FILL
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                )
                              );
                            })}

                          {p.multiCompanyData.length > 0 &&
                            p.multiCompanyData
                              .filter((m) => m.companyId == 99999 && m.companyName == 'PreviousBalance')
                              .map((c) => {
                                return (
                                  <div className={classes.subRowData}>
                                    <div className={classes.companyName}>Previous Balance</div>
                                    <div style={{ width: '200px' }}>
                                      <FormControl style={{ width: '60%', marginRight: '30px', marginBottom: '20px' }}>
                                        <InputLabel htmlFor="BalanceDue" shrink>
                                          Note
                                        </InputLabel>
                                        <Input
                                          placeholder="Note"
                                          defaultValue={c.multiNote}
                                          value={c.multiNote}
                                          onChange={(e) => this.handleEditPaymentChange('multiNote', e.target.value, p)}
                                          type="text"
                                          style={{ width: '90%' }}
                                          name="Note"
                                        />
                                      </FormControl>
                                    </div>
                                    <div>
                                      {' '}
                                      <FormControl style={{ marginRight: '30px', marginBottom: '20px' }}>
                                        <TextField
                                          label="Amount"
                                          InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,

                                            type: 'number',
                                            defaultValue: (c !== undefined ? c.amount : 0).toLocaleString(),
                                            onChange: (e) =>
                                              this.handleEditPaymentChange('multiAmount', e.target.value, p),

                                            step: 0.1,
                                            min: 0,
                                          }}
                                        />
                                      </FormControl>
                                    </div>
                                  </div>
                                );
                              })}

                          <div>
                            <div
                              style={{
                                background: totalPayment > p.amount ? 'orange' : '',
                                padding: '16px',
                                fontWeight: 700,
                              }}
                            >
                              Total: {numberToDollars(totalPayment || 0)}
                            </div>

                            {totalPayment != p.amount && (
                              <div
                                style={{
                                  color: '#FFA52D',
                                  paddingLeft: '4px',
                                  display: 'flex',
                                  padding: '13px',
                                  background: '#FFEDD6',
                                }}
                              >
                                <InfoOutlinedIcon />

                                <span style={{ color: 'black', paddingLeft: '8px', paddingTop: '3px' }}>
                                  {' '}
                                  The total Check amount and the total amount towards the invoice payment don't match
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

          {noPaymentCompany.map((p) => {
            const companyData =
              p.method == 'Previous Balance' &&
              allCompanys.filter((p) => p.CompanyName == 'Previous Balance').length == 0
                ? [
                    ...allCompanys,
                    { CompanyName: 'Previous Balance', amount: 0, companyId: 99999, productType: 'PreviousBalance' },
                  ]
                : allCompanys;
            return (
              <div className={classes.dialogShadow} style={{ display: 'flex' }}>
                <div className={classes.lineBorder}>
                  {p.isShowRow == true ? (
                    <KeyboardArrowRightIcon style={{ fontSize: '35px' }} />
                  ) : (
                    <KeyboardArrowDownIcon style={{ fontSize: '35px' }} />
                  )}
                </div>
                <div style={{ width: '100%', margin: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* <div style={{ width: '12%', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                    <a style={{ color: '#2c7841' }} onClick={() => this.addNewRow(p)}>
                      Add Payment Row
                    </a>
                 </div>*/}

                    <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                      <InputLabel id="PaymentMethod">PaymentMethod</InputLabel>
                      <Select
                        label="PaymentMethod"
                        name="method"
                        id="PaymentMethod"
                        value={p.method}
                        defaultValue={p.method}
                        onChange={(e) => this.handleChange('method', e.target.value, p)}

                        // disabled={editingPayment !== null && editingPayment.id == pp.id ? false : true}
                      >
                        {['Check', 'Cash', 'Return', 'Adjustment', 'JDF Financing', 'Previous Balance'].map(
                          (method) => (
                            <MenuItem value={method} key={method}>
                              {method}
                            </MenuItem>
                          ),
                        )}
                      </Select>
                    </FormControl>
                    {currentPurchaseOrder.isSimple !== true && (
                      <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                        <InputLabel id="ShareHolder">ShareHolder</InputLabel>

                        <Select
                          id="ShareHolder"
                          label="ShareHolder"
                          name="shareholder"
                          value={p.shareholderId}
                          onChange={(e) => this.handleChange('shareholderId', e.target.value, p)}

                          // disabled={editingPayment !== null && editingPayment.id == a.id ? false : true}
                        >
                          <MenuItem value={0}>{customer.name}</MenuItem>
                          {shareholders
                            .filter((c) => c.customerId == currentPurchaseOrder.customerId)
                            .map((shareholder) => (
                              <MenuItem value={shareholder.id} key={shareholder.id} id={shareholder.name}>
                                {shareholder.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    )}
                    <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '20px' }}>
                      <TextField
                        label="CheckAmount"
                        id="amount"
                        inputProps={{
                          type: 'number',
                          defaultValue: p.amount,
                          onChange: (e) => this.handleChange('amount', e.target.value, p),

                          step: 0.1,
                          min: 0,
                        }}
                      />
                    </FormControl>
                    <div style={{ width: '20%', marginBottom: '20px' }}>
                      <DatePicker
                        leftArrowIcon={<NavigateBefore />}
                        rightArrowIcon={<NavigateNext />}
                        format="MM/DD/YYYY"
                        emptyLabel="Date"
                        label="PaymentDate"
                        value={moment.utc(p.paymentDate).format('MM/DD/YYYY')}
                        onChange={(e) =>
                          this.handleChange('paymentDate', moment.utc(e._d).format('YYYY-MM-DD') + 'T00:00:00.000Z', p)
                        }
                      />
                    </div>
                    <FormControl style={{ width: '20%', marginRight: '30px', marginBottom: '5px' }}>
                      <InputLabel htmlFor="BalanceDue" shrink>
                        Note
                      </InputLabel>
                      <TextField
                        // //label="Note"
                        id="note"
                        multiline
                        inputProps={{
                          type: 'text',
                          defaultValue: p.note,
                          onChange: (e) => this.handleChange('note', e.target.value, p),
                        }}
                      />
                    </FormControl>

                    {p.hasOwnProperty('id') ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CheckIcon
                          id="checkTransfer"
                          onClick={async () => {
                            await this.createPayment(p.id, 'noPaymentCompany');
                            await this.setState({ allCompanys: allCompanys.filter((d) => d.companyId !== 99999) });

                            await this.props.refreshpayment();
                          }}
                          style={{ color: 'green' }}
                        />
                        <CloseIcon
                          style={{ color: 'red' }}
                          onClick={() => {
                            this.setState({
                              noPaymentCompany: noPaymentCompany.filter((n) => n.id !== p.id),
                            });
                          }}
                        />
                      </div>
                    ) : (
                      <CircularProgress size={24} />
                    )}
                  </div>

                  <div className={classes.subRowContainer}>
                    {companyData.length > 0 &&
                      companyData.map((c, i) => {
                        const isFind =
                          c.isPaymentData && c.isPaymentData.find((d) => d.id == p.id && d.companyId == p.companyId);
                        const multiCompanyAmount =
                          p.multiCompanyData &&
                          p.multiCompanyData.find((d) => d.companyId == c.companyId && d.companyName == c.productType);
                        const isDisable = document.getElementById(`isDisable-${p.id}-${c.companyId}-${c.CompanyName}`);
                        const noteValue =
                          multiCompanyAmount !== undefined
                            ? multiCompanyAmount.multiNote
                            : isFind !== undefined
                            ? isFind.note
                            : '';

                        const isFieldDisable =
                          c.CompanyName === 'Previous Balance' ? false : isDisable !== null ? !isDisable.checked : true;

                        const value = c.CompanyName == 'Previous Balance' ? undefined : c;
                        const currentBalnceDue = [
                          ...tableDatas[0].allBalanceDueData,
                          ...tableDatas[0].getRemainPaymentData,
                        ].filter((d) => d.productType == c.productType);

                        const currentDate = currentBalnceDue.find(
                          (d) => moment(d.earlyPayDeadLinedate).format() > moment(p.paymentDate).format(),
                        );

                        const currentBalnceDueBayer =
                          currentBalnceDue.length > 0 && currentBalnceDue[0].hasOwnProperty('preTotal')
                            ? currentBalnceDue[0].total
                            : moment.utc(p.paymentDate) == moment.utc(new Date())
                            ? currentBalnceDue[currentBalnceDue.length - 1].finalBalanceDue
                            : currentDate
                            ? currentDate.finalBalanceDue
                            : currentBalnceDue[0].finalBalanceDue;
                        return (
                          <div className={classes.subRowData}>
                            {' '}
                            {c.CompanyName !== 'Previous Balance' && (
                              <div style={{ marginRight: '20px', marginTop: '-10px' }}>
                                <FormControl>
                                  <Checkbox
                                    id={`isDisable-${p.id}-${c.companyId}-${c.CompanyName}`}
                                    color="primary"
                                    onChange={(e) => {
                                      this.setState({ allCompanys: companyData });
                                    }}
                                  />
                                </FormControl>
                              </div>
                            )}
                            <div className={classes.companyName}>{c.CompanyName}</div>
                            <div style={{ width: '200px' }}>
                              {c.CompanyName !== 'Previous Balance' ? (
                                <FormControl style={{ marginRight: '30px', marginBottom: '20px' }}>
                                  <InputLabel htmlFor="BalanceDue" shrink>
                                    Balance Due
                                  </InputLabel>
                                  <Input
                                    placeholder="Balance Due"
                                    disableUnderline={true}
                                    disabled={true}
                                    defaultValue={numberToDollars(
                                      c.hasOwnProperty('finalInvoiceAmount') ? currentBalnceDueBayer : c.total,
                                    )}
                                    value={numberToDollars(
                                      c.hasOwnProperty('finalInvoiceAmount') ? currentBalnceDueBayer : c.total,
                                    )}
                                    style={{ width: '90%' }}
                                    name="BalanceDue"
                                  />
                                </FormControl>
                              ) : (
                                <FormControl style={{ width: '60%', marginRight: '60px', marginBottom: '20px' }}>
                                  <InputLabel htmlFor="Note" shrink>
                                    Note
                                  </InputLabel>
                                  <Input
                                    placeholder="Note"
                                    defaultValue={noteValue}
                                    value={noteValue}
                                    onChange={(e) => this.handleChange('multiNote', e.target.value, p, value)}
                                    type="text"
                                    style={{ width: '90%' }}
                                    name="Note"
                                  />
                                </FormControl>
                              )}
                            </div>
                            <div>
                              {' '}
                              <div style={{ display: 'flex' }}>
                                <FormControl style={{ marginRight: '30px', marginBottom: '20px', display: 'flex' }}>
                                  <InputLabel htmlFor="Amount" shrink>
                                    Amount
                                  </InputLabel>
                                  <Input
                                    label="Amount"
                                    id={`${c.CompanyName}-amount`}
                                    placeholder="Amount"
                                    disabled={isFieldDisable}
                                    disableUnderline={true}
                                    type="number"
                                    name="Amount"
                                    defaultValue={
                                      multiCompanyAmount !== undefined
                                        ? multiCompanyAmount.amount
                                        : // : isFind !== undefined
                                          // ? isFind.amount
                                          0
                                    }
                                    value={multiCompanyAmount !== undefined ? multiCompanyAmount.amount : 0}
                                    onChange={(e) => this.handleChange('multiAmount', e.target.value, p, value)}
                                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                  />
                                </FormControl>
                                <a
                                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                                  onClick={() =>
                                    !isFieldDisable &&
                                    this.handleChange(
                                      'multiAmount',
                                      c.hasOwnProperty('finalInvoiceAmount') ? currentBalnceDueBayer : c.total,
                                      p,
                                      value,
                                    )
                                  }
                                >
                                  FILL
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            );
          })}
          <div className={classes.finalrow}>
            <p>TotalBalanceDue : {numberToDollars(totalBalanceDue)} </p>
            <p style={{ marginLeft: '105px' }}>TotalPaymentAmount : {numberToDollars(totalPayment)}</p>
          </div>
          <div>
            {groupNote.length > 0 && (
              <ReactTable
                data={groupNote}
                columns={[
                  {
                    Header: 'Note',
                    headerStyle: {
                      color: '#3C4858',

                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      textAlign: 'left',
                    },
                    accessor: (d) => d,
                    sortMethod: (a, b) => {
                      return parseFloat(a) - parseFloat(b);
                    },
                    id: 'Note',
                    sortable: true,

                    Cell: (props) => {
                      const order = props.value;

                      return <div>{order.note || ''}</div>;
                    },
                  },
                  {
                    Header: 'Amount',
                    headerStyle: {
                      color: '#3C4858',

                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      textAlign: 'left',
                    },
                    accessor: (d) => d,
                    sortMethod: (a, b) => {
                      return parseFloat(a) - parseFloat(b);
                    },
                    id: 'Amount',
                    sortable: true,

                    Cell: (props) => {
                      const order = props.value;
                      return numberToDollars(order.amount);
                    },
                  },
                ]}
                sortable={false}
                showPagination={false}
                minRows={1}
              ></ReactTable>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(paymentDialogStyles)(PaymentDialog);

// (
//   <DialogContent>
//     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//       <DatePicker
//         leftArrowIcon={<NavigateBefore />}
//         rightArrowIcon={<NavigateNext />}
//         format="MMMM Do YYYY"
//         emptyLabel="Date"
//         value={paymentDate}
//         onChange={(e) => this.setState({ paymentDate: moment.utc(e._d).format('YYYY-MM-DD') + 'T00:00:00.000Z' })}
//       />
//       <div style={{ display: 'flex', width: '50%', justifyContent: 'space-between' }}>
//         <p>Invoice Amount :{tableDatas && numberToDollars(tableDatas[0].amount)}</p>
//         <p>Balance Due: {tableDatas && numberToDollars(tableDatas[0].balanceDue)}</p>
//         {/* <p>Amount Paid: </p> */}
//       </div>
//     </div>
//     <br />
//     <div className={classes.middleRow}>
//       <FormControl style={{ width: '40%' }}>
//         <TextField
//           label="Amount"
//           id="amount"
//           inputProps={{
//             type: 'number',
//             defaultValue: amount,
//             onChange: (e) => this.setState({ amount: e.target.value }),
//             step: 0.1,
//             min: 0,
//           }}
//         />
//       </FormControl>
//       <br />
//       <FormControl style={{ width: '40%' }}>
//         <InputLabel htmlFor="method">Payment method </InputLabel>
//         <Select name="method" value={method} onChange={(e) => this.onSelectMethodChange(e.target.value)}>
//           {['Check', 'Cash', 'Return', 'Adjustment', 'JDF Financing'].map((method) => (
//             <MenuItem value={method} key={method}>
//               {method}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//     </div>

//     <FormControl className={classes.select} style={{ marginTop: '20px' }}>
//       <InputLabel htmlFor="selectedCompanies">Apply payment towards products belonging to :</InputLabel>
//       <Select
//         id="selectedCompanies"
//         name="selectedCompanies"
//         value={selectedCompanies}
//         onChange={(e) => {
//           console.log(e.target.value);
//           const findList = compainesMenuList.find((c) => c.companyId == e.target.value);

//           this.setState({
//             selectedCompanies: e.target.value,
//             companyId: findList !== undefined ? findList.companyId : '',
//             companyType: findList !== undefined ? findList.companyType : '',
//           });
//         }}
//       >
//         {compainesMenuList.length > 0 &&
//           compainesMenuList
//             .filter((c) => c.List.includes(true))
//             .map((c) => (
//               <MenuItem value={c.companyId} key={c.companyId} id={c.productName}>
//                 {c.productName}
//               </MenuItem>
//             ))}
//         {compainesMenuList.length > 0 &&
//           compainesMenuList
//             .filter((c) => c.List.includes(true) == false)
//             .map((c) => (
//               <MenuItem value={c.companyId} key={c.companyId} id={c.productName}>
//                 {c.productName}
//               </MenuItem>
//             ))}
//       </Select>
//     </FormControl>
//     <br />
//     <FormControl className={classes.select}>
//       <CustomInput
//         labelText={'Note'}
//         id="note"
//         inputProps={{
//           type: 'text',
//           defaultValue: note,
//           onChange: (e) => this.setState({ note: e.target.value }),
//         }}
//       />
//     </FormControl>
//     <br />
//     {method === 'Return' && (
//       <FormControl className={classes.select}>
//         <CustomInput
//           labelText={'Paid By'}
//           id="payBy"
//           inputProps={{
//             type: 'text',
//             defaultValue: payBy,
//             onChange: (e) => this.setState({ payBy: e.target.value }),
//           }}
//         />
//       </FormControl>
//     )}
//     {shareholders.length > 0 && (
//       <FormControl className={classes.select}>
//         <InputLabel htmlFor="shareholder">Shareholder</InputLabel>
//         <Select
//           id="shareholderChoose"
//           name="shareholder"
//           value={shareholderId}
//           onChange={(e) => this.onSelectShareholderChange(e.target.value)}
//         >
//           <MenuItem value={0}>{customer.name}</MenuItem>
//           {shareholders
//             .filter((c) => c.customerId == currentPurchaseOrder.customerId)
//             .map((shareholder) => (
//               <MenuItem value={shareholder.id} key={shareholder.id} id={shareholder.name}>
//                 {shareholder.name}
//               </MenuItem>
//             ))}
//         </Select>
//       </FormControl>
//     )}
//   </DialogContent>
