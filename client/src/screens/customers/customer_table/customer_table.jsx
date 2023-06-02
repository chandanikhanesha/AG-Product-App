import React, { Component } from 'react';

export default class CustomerTable extends Component {
  getTableRowProps = (_, rowInfo) => {
    const { recentCreatedCustomerMetaId } = this.props;
    return {
      style: {
        background:
          rowInfo &&
          rowInfo.original &&
          rowInfo.original.meta &&
          rowInfo.original.meta.id === recentCreatedCustomerMetaId
            ? '#FFF6E1'
            : 'transparent',
      },
    };
  };

  componentWillMount() {
    this.setCustomerTableColumn();
  }

  handleTableItemActionMenuOpen = (item) => (event) => {
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
      activeTableItem: item,
    });
  };

  handleTableItemActionMenuClose = () => {
    this.setState({
      tableItemActionMenuOpen: false,
      activeTableItem: null,
    });
  };

  setCustomerTableColumn() {
    const customerTableColumns = [
      {
        Header: 'Customer',
        show: true,
        id: 'customer',
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const customer = props.value;
          return (
            <div>
              <Tooltip title="View Custom Details">
                <p
                  onClick={() => {
                    this.handleViewCustomerDialogOpen();
                    this.setState({ viewCustomer: customer });
                  }}
                  className={classes.linkQT}
                >
                  {customer.name}
                </p>
              </Tooltip>
            </div>
          );
        },
      },
      {
        Header: 'Quotes',
        show: true,
        id: 'quote',
        accessor: (d) => d,
        Cell: (props) => {},
      },
      {
        Header: 'Purchase Orders',
        show: true,
        id: 'purchase_orders',
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const customer = props.value;
          const purchaseOrders = customer.PurchaseOrders.filter((po) => !po.isQuote);
          const needsPurchaseOrder = purchaseOrders.length;
          return (
            <div>
              {needsPurchaseOrder === 0 ? (
                <Tooltip title="Create a new purchase order">
                  <Button
                    simple={true}
                    color="primary"
                    className={classes.createPO}
                    onClick={this.handleCreatePurchaseOrderDialogOpen(customer.id, false)}
                    disabled={isPending(customer)}
                  >
                    New Purchase Order
                  </Button>
                </Tooltip>
              ) : (
                this.getPurchaseOrderLinks(customer.id, purchaseOrders)
              )}
            </div>
          );
        },
      },
      {
        Header: 'Invoices & Payments',
        show: true,
        id: 'invoices_payments',
        accessor: (d) => d,
        Cell: (props) => {
          const customer = props.value;
          const purchaseOrders = customer.PurchaseOrders.filter((po) => !po.isQuote);
          if (purchaseOrders.length === 0) {
            return <div>N/A</div>;
          }
          const total = customer.customerTotalPayment;
          if (total === 0) {
            return (
              <div>
                IN#{purchaseOrders[0].id}
                <br />
                <p>$0/$0</p>
              </div>
            );
          }
          const paid = customer.customerTotalPaid;
          return (
            <div>
              IN#{purchaseOrders[0].id}
              <br />
              <LinearProgress
                className={this.props.classes.tableItemLinearProgress}
                variant="determinate"
                value={(paid / total) * 100}
              />
              <p>
                ${paid}/${total}
              </p>
            </div>
          );
        },
      },
      {
        Header: 'Deliveries',
        show: true,
        id: 'deliveries',
        accessor: (d) => d,
        Cell: (props) => {
          const customer = props.value;
          const { deliveryReceipts } = this.props;
          const purchaseOrders = customer.PurchaseOrders.filter((po) => !po.isQuote);
          if (purchaseOrders.length === 0) {
            return <div>N/A</div>;
          }
          const purchaseOrder = purchaseOrders[0];
          const delivered = customer.customerTotalDelivered;
          const totalDeliveries = customer.customerTotalDelivery;
          return (
            <div>
              {delivered}/{totalDeliveries}
              <br />
              {totalDeliveries !== 0 && (
                <LinearProgress
                  className={this.props.classes.tableItemLinearProgress}
                  variant="determinate"
                  value={(delivered / totalDeliveries) * 100}
                />
              )}
              <p>DL#{purchaseOrder.id}</p>
            </div>
          );
        },
      },
      {
        Header: '',
        show: true,
        id: 'actions',
        accessor: (d) => d,
        maxWidth: 60,
        sortable: false,
        Cell: (props) => (
          <React.Fragment>
            <IconButton aria-label="delete" onClick={this.handleTableItemActionMenuOpen(props.value)}>
              <MoreHorizontalIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        ),
      },
    ];
    this.setState({
      customerTableColumns,
    });
  }

  render() {
    const {
      customers,

      // Function Related
    } = this.props;
    const { customerTableColumns, tableItemActionAnchorEl, tableItemActionMenuOpen } = this.state;
    return (
      <>
        <ReactTable
          data={customers}
          columns={customerTableColumns}
          minRows={1}
          resizable={false}
          showPagination={false}
          getTrProps={this.getTableRowProps}
        ></ReactTable>
        <Popover
          open={tableItemActionMenuOpen}
          anchorEl={tableItemActionAnchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          onClose={this.handleTableItemActionMenuClose}
        >
          <Paper>
            <MenuList>
              {/* <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  this.duplicateCustomer();
                  this.handleTableItemActionMenuClose();
                }}
              >
                Duplicate
              </MenuItem> */}
              <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  this.archiveCustomer();
                  this.handleTableItemActionMenuClose();
                }}
              >
                Archive
              </MenuItem>
            </MenuList>
          </Paper>
        </Popover>
      </>
    );
  }
}
