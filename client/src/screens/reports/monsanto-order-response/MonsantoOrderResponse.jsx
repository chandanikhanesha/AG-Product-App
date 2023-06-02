import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import ReactTable from 'react-table';
import moment from 'moment';
import axios from 'axios';

import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '../../../components/material-dashboard/Card/Card';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import { MonsantoOrderResponseStyles } from './monsanto_order_response.styles';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

class MonsantoOrderResponse extends Component {
  state = {
    showSnackbar: false,
    messageForSnackBar: '',
    moreFuncMenuOpen: false,
    tableColumns: [
      {
        Header: 'Products',
        show: true,
        id: 'product',
        width: 250,
        accessor: (d) => d,
        Cell: (props) => {
          const { Product } = props.value;
          return Product ? Product.productDetail : '-';
        },
      },
      // {
      //   Header: 'Sold To',
      //   show: true,
      //   accessor: 'soldTo',
      //   width: 350,
      // },
      {
        Header: 'ChangeIndicatorType',
        show: true,
        accessor: 'changeIndicatorType',
      },
      {
        Header: 'ChangeExplanation',
        show: true,
        accessor: 'changeExplanation',
      },
      {
        Header: 'MadeBy',
        show: true,
        accessor: 'madeBy',
      },
      {
        Header: 'Quantity',
        show: true,
        accessor: 'quantity',
      },
      // {
      //   Header: 'Comments',
      //   show: true,
      //   accessor: 'comments',
      //   width: 450,
      // },
      {
        Header: 'increased/decreased',
        show: true,
        accessor: 'increaseDecrease',
        width: 200,
        headerStyle: { textAlign: 'left' },
      },
      {
        Header: 'Performed On',
        show: true,
        id: 'increaseDecreaseDateTime',
        headerStyle: { textAlign: 'left' },
        accessor: (d) => d,
        Cell: (props) => {
          const { increaseDecreaseDateTime } = props.value;
          return increaseDecreaseDateTime ? moment.utc(increaseDecreaseDateTime).format('MM/DD/YYYY') : '-';
        },
      },
    ],
  };

  componentDidMount() {
    this.props.orderResponseList(true);
  }

  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };

  handleMoreFuncMenuClose = () => {
    this.setState({ moreFuncMenuOpen: false });
  };

  loadOrderResponseList = () => {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/order_response_log`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        this.props.orderResponseList(true);
        this.setState({ isPageSyncing: false });
        this.handleMoreFuncMenuClose();
        this.setShowSnackbar('Sync Summary Data successfully');
      })
      .catch((e) => {
        this.setState({ isPageSyncing: false });
        this.handleMoreFuncMenuClose();
        console.log('e : ', e);
      });
  };

  render() {
    const { order_response_list, isLoading, classes } = this.props;
    const { tableColumns, moreFuncMenuOpen } = this.state;

    const final_order_response_list = order_response_list
      .map((item) => {
        let changeIndicatorType, changeExplanation, madeBy;
        if (Array.isArray(item.comments) && item.comments.length > 1) {
          const [ChangeIndicatorType, ChangeExplantion, MadeBy] = item.comments;
          changeIndicatorType = ChangeIndicatorType.split(';')[1];
          changeExplanation = ChangeExplantion.split(';')[1];
          madeBy = MadeBy.split(';')[1];
        }
        return { ...item, changeIndicatorType, changeExplanation, madeBy };
      })
      .sort((a, b) => new Date(b.increaseDecreaseDateTime) - new Date(a.increaseDecreaseDateTime));

    return (
      <div>
        <h3 className={classes.cardIconTitle}> {isLoading ? <CircularProgress /> : null} Order Response Logs</h3>
        <Card>
          <CardBody className={classes.cardBody}>
            <div>
              <Button
                className={`${classes.iconButton} hide-print`}
                variant="contained"
                color="primary"
                align="right"
                buttonRef={(node) => {
                  this.moreFuncMenuAnchorEl = node;
                }}
                onClick={this.handleMoreFuncMenuToggle}
                style={{
                  float: 'right',
                }}
              >
                <MoreHorizontalIcon />
              </Button>
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
                    <MenuItem className={classes.addNewMenuItem} onClick={this.loadOrderResponseList}>
                      Order Response Log
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Popover>
            </div>
            <ReactTable data={final_order_response_list} columns={tableColumns} minRows={1} showPagination={true} />
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default withStyles(MonsantoOrderResponseStyles)(MonsantoOrderResponse);
