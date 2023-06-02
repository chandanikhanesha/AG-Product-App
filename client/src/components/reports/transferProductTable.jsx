import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { format } from 'date-fns';

// material-ui icons
import MoreHoriz from '@material-ui/icons/MoreHoriz';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import ReactTable from 'react-table';
import Button from '../../components/material-dashboard/CustomButtons/Button';

import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

// custom component
import ColumnMenu from '../inventory/column_menu';

const styles = (theme) => ({
  actionBar: {
    marginTop: '-90px',
    float: 'right',
    display: 'inline-flex',
  },
  horizTableMenu: {
    marginRight: 20,
    border: `1px solid ${theme.palette.primary.main}`,
  },
  horizTableMenuItem: {
    borderRadius: '3px',
    margin: '0 8px',
    padding: '12px 24px',
    transition: 'none',
    '&:hover': {
      background: '#38A154',
      color: 'white',
      boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.36)',
    },
  },
  columnMenu: {
    marginRight: 20,
  },
  columnHeaderOverride: {
    overflow: 'visible',
    whiteSpace: 'normal',
  },
  productTableContainer: {
    marginTop: 32,
  },
  productTable: {
    '& .rt-thead .rt-th:last-child': {
      textAlign: 'left',
    },
    '& .rt-thead .rt-th': {
      lineHeight: '1.5em !important',
      fontWeight: 'bold',
      color: '#000',
      fontSize: 18,
      whiteSpace: 'normal',
    },
    '& .rt-thead .rt-th.-cursor-pointer:first-of-type > div:first-of-type::after': {
      display: 'none',
    },
    '@media print': {
      '& .rt-td, & .rt-thead .rt-th': {
        fontSize: '10px !important',
        width: '75px !important',
        flex: '0 0 auto!important',
        margin: '15px 10px',
      },
      '& .rt-thead .rt-th.-cursor-pointer > div:first-of-type::after': {
        display: 'none',
      },
    },
  },
});

class ProductTable extends Component {
  state = {
    menuList: [],
    columns: [],
    horizMenuOpen: false,
  };

  handleHorizMenuToggle = () => {
    this.setState((state) => ({ horizMenuOpen: !state.horizMenuOpen }));
  };

  handleHorizMenuClose = (event) => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ horizMenuOpen: false });
  };

  componentDidMount() {
    const { products, productType, seedMap } = this.props;
    const dealerNames = products
      .filter((p) => p.seedType === seedMap[productType])
      .map((p) => p.transferInfo.seedDealerName);

    const columns = [
      {
        Header: 'Trait',
        accessor: 'brand',
        show: true,
        filterable: false,
      },
      {
        Header: 'Variety',
        accessor: 'blend',
        show: true,
        filterable: false,
      },
      {
        Header: 'Treatment',
        accessor: 'treatment',
        show: true,
        filterable: false,
      },
      {
        Header: 'MSRP',
        headerStyle: styles.columnHeaderOverride,
        accessor: 'msrp',
        className: 'hide-print',
        show: true,
        filterable: false,
      },
      {
        Header: 'Transfer IN/OUT',
        headerStyle: styles.columnHeaderOverride,
        accessor: 'transfer',
        className: 'hide-print',
        show: true,
        Cell: ({ value }) => value.toUpperCase(),
        filterMethod: (filter, rows) => {
          if (filter.value === 'all') {
            return true;
          }
          return filter.value === rows.transfer;
        },
        Filter: ({ filter, onChange, original }) => {
          return (
            <select
              onChange={(event) => onChange(event.target.value)}
              style={{ width: '100%', fontSize: 14 }}
              value={filter ? filter.value : 'all'}
            >
              <option key="show all" value="all">
                Show All
              </option>
              <option key="in" value="in">
                In
              </option>
              <option key="out" value="out">
                Out
              </option>
            </select>
          );
        },
      },
      {
        Header: 'Dealer Name',
        headerStyle: styles.columnHeaderOverride,
        accessor: 'transferInfo.seedDealerName',
        className: 'hide-print',
        id: 'seedDealerName',
        show: true,
        Cell: ({ value }) => value,
        filterMethod: (filter, rows) => {
          if (filter.value === 'all') {
            return true;
          }
          return filter.value === rows.seedDealerName;
        },
        Filter: ({ filter, onChange, original }) => {
          return (
            <select
              onChange={(event) => onChange(event.target.value)}
              style={{ width: '100%', fontSize: 14 }}
              value={filter ? filter.value : 'all'}
            >
              <option key="show all" value="all">
                Show All
              </option>
              {[...new Set(dealerNames)].map((name, idx) => (
                <option key={`${name}-${idx}`} value={name}>
                  {name}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        Header: 'Dealer ID',
        headerStyle: styles.columnHeaderOverride,
        accessor: 'transferInfo.seedDealerId',
        className: 'hide-print',
        show: true,
        filterable: false,
      },
      {
        Header: 'Dealer Addr',
        headerStyle: styles.columnHeaderOverride,
        accessor: 'transferInfo.seedDealerAddress',
        className: 'hide-print',
        show: true,
        filterable: false,
      },
      {
        Header: 'Date',
        headerStyle: styles.columnHeaderOverride,
        id: 'seedDealerTransferDate',
        accessor: (d) => format(d.transferInfo.seedDealerTransferDate, 'MMM Do, YYYY'),
        className: 'hide-print',
        show: true,
        filterable: false,
      },
      {
        Header: 'Quantity',
        headerStyle: styles.columnHeaderOverride,
        accessor: 'orderAmount',
        className: 'hide-print',
        show: true,
        filterable: false,
      },
    ];
    const getColumnHeader = (column) => ({
      Header: column.Header,
      show: column.show,
    });
    const menuList = columns.map(getColumnHeader);
    this.setState({ columns, menuList });
  }

  toggleColumnMenu = (productType, header) => {
    const { columns } = this.state;

    this.setState((prevState) => {
      const updatedColumns = columns.map((col) => {
        if (col.Header === header) {
          return {
            ...col,
            show: !col.show,
          };
        } else {
          return col;
        }
      });

      const updatedMenuList = updatedColumns.map((col) => ({
        Header: col.Header,
        show: col.show,
      }));

      return {
        columns: updatedColumns,
        menuList: updatedMenuList,
      };
    });
  };

  render() {
    const { columns, menuList, horizMenuOpen } = this.state;
    const { classes, print, productType, products, savePageAsPdf, seedMap, toggleColumns, theme } = this.props;
    return (
      <GridContainer className={classes.productTableContainer}>
        <GridItem xs={12}>
          <div className={classes.actionBar}>
            <Button
              buttonRef={(node) => {
                this.anchorEl = node;
              }}
              aria-owns={horizMenuOpen ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              onClick={this.handleHorizMenuToggle}
              style={{ background: horizMenuOpen ? theme.palette.primary.main : 'inherit' }}
              justIcon
              className={classes.horizTableMenu}
            >
              <MoreHoriz style={{ color: horizMenuOpen ? '#fff' : theme.palette.primary.main }} />
            </Button>
            <Popover
              open={horizMenuOpen}
              anchorEl={this.anchorEl}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              onClose={this.handleHorizMenuClose}
            >
              <Paper>
                <MenuList>
                  <MenuItem className={classes.horizTableMenuItem} onClick={print}>
                    Print
                  </MenuItem>
                  <MenuItem className={classes.horizTableMenuItem} onClick={savePageAsPdf}>
                    Save as PDF
                  </MenuItem>
                </MenuList>
              </Paper>
            </Popover>
            {toggleColumns && (
              <ColumnMenu
                onColumnUpdate={this.toggleColumnMenu}
                columns={menuList}
                productType={productType}
                className={classes.columnMenu}
              />
            )}
          </div>
          <ReactTable
            data={products.filter((p) => p.seedType === seedMap[productType])}
            columns={columns}
            resizable={false}
            defaultPageSize={100}
            minRows={1}
            showPagination={false}
            className={classes.productTable + ' -striped -highlight'}
            filterable
            defaultFilterMethod={(filter, row) => String(row[filter.id]) === filter.value}
          />
        </GridItem>
      </GridContainer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProductTable);
