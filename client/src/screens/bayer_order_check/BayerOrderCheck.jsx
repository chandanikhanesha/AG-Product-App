import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';

import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import { customersStyles } from '../customers/customers.styles';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

class BayerOrderCheck extends Component {
  state = {
    tableColumns: [
      {
        Header: 'Customer Name',
        accessor: 'customerName',
        filterable: true,
        width: 400,
        Filter: ({ filter, onChange }) => (
          <CustomInput
            placeholder="Search By Customer"
            formControlProps={{ fullWidth: true }}
            inputProps={{
              onChange: (event) => onChange(event.target.value),
              value: filter ? filter.value : '',
            }}
          />
        ),
      },
      {
        Header: 'Purchase Orders',
        accessor: 'poID',
        width: 250,
        filterable: true,
        Cell: (props) => {
          const { classes } = this.props;
          const { customerId, poID } = props.original;
          return (
            <Link key={poID} to={`/app/customers/${customerId}/purchase_order/${poID}`} className={classes.linkQT}>
              PO#{poID}
              {/* {po.name ? "(" + po.name + ")" : ""} */}
            </Link>
          );
        },
        Filter: ({ filter, onChange }) => (
          <CustomInput
            placeholder="Search By Purchase Order ID"
            formControlProps={{ fullWidth: true }}
            inputProps={{
              onChange: (event) => onChange(event.target.value),
              value: filter ? filter.value : '',
            }}
          />
        ),
      },
      {
        Header: 'Comments',
        accessor: 'comment',
        headerStyle: {
          textAlign: 'left',
        },
      },
    ],
  };

  componentDidMount() {
    this.props.getBayer_order_check(true);
  }

  render() {
    const { bayer_order_check_data, isLoading, classes } = this.props;
    const { tableColumns } = this.state;
    return (
      <div>
        <h3 className={classes.cardIconTitle}> {isLoading ? <CircularProgress /> : null} Bayer Order Check</h3>
        <Card>
          <CardBody className={classes.cardBody}>
            <ReactTable data={bayer_order_check_data} columns={tableColumns} minRows={1} showPagination={true} />
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default withStyles(customersStyles)(BayerOrderCheck);
