import React, { Component } from 'react';
import ReactTable from 'react-table';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { groupBy } from 'lodash';
import moment from 'moment';

import { summarySyncHistoryList } from '../../store/actions';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '../../components/material-dashboard/CustomButtons/Button';

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/fancy-example.css';

class SummarySyncHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      classification: this.props.data[0].Product.classification,
      tableColumns: [
        {
          Header: 'Variety',
          className: 'sticky',
          headerClassName: 'sticky',
          width: 150,
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#000000',
          },
          id: 'Variety',
          accessor: (product) => product.Product.blend,
        },
        {
          Header: 'Trait',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#000000',
          },
          id: 'Trait',
          accessor: (product) => product.Product.brand,
        },
        {
          Header: 'Treatment',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#000000',
          },
          width: 150,
          id: 'treatment',
          accessor: (product) => product.Product.treatment,
        },
        {
          Header: 'Packaging',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#000000',
          },
          id: 'Packaging',
          accessor: (product) => {
            return (
              <div style={{ textAlign: 'center' }}>
                {product.Product.packaging ? product.Product.packaging : product.Product.productDetail.split(' ')[2]}
              </div>
            );
          },
        },
        {
          Header: 'Seedsize',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#000000',
          },
          id: 'seedsize',
          accessor: (product) => {
            return (
              <div style={{ textAlign: 'center' }}>{product.Product.seedSize ? product.Product.seedSize : '-'}</div>
            );
          },
        },
        {
          Header: 'Dealer Bucket',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#000000',
          },
          id: 'bayerDealerBucketQty',
          accessor: (product) => {
            return (
              <div style={{ textAlign: 'center' }}>
                {product.bayerDealerBucketQty + '(' + product.bayerDealerBucketQtyBefore + ')'}
              </div>
            );
          },
        },
        {
          Header: 'All Growers',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#000000',
          },
          id: 'allGrowerQty',
          accessor: (product) => {
            return (
              <div style={{ textAlign: 'center' }}>{product.allGrowerQty + '(' + product.allGrowerQtyBefore + ')'}</div>
            );
          },
        },
        {
          Header: 'Supply',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#000000',
          },
          id: 'supply',
          accessor: (product) => {
            // return <div style={{ textAlign: 'center' }}>{product.supply}</div>;
            return (
              <div style={{ textAlign: 'center' }}>
                {product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0}
              </div>
            );
          },
        },
      ],
    };
  }

  componentDidMount() {
    this.props.summarySyncHistoryList(true);
  }

  render() {
    const { summarySyncHistories, isLoading, classes, onClose, retailOrderSummaryLasySyncDate, open } = this.props;
    const { tableColumns, classification } = this.state;

    const grouped = groupBy(
      summarySyncHistories.filter((p) => p.Product.classification == classification),
      (history) => history.syncId,
    );
    const syncIds = Object.keys(grouped);
    return (
      <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title" maxWidth="xl">
        <DialogTitle id="form-dialog-title">History</DialogTitle>
        <DialogContent>
          <div>Product Booking Summary and Retailer Order Summary last updated: {retailOrderSummaryLasySyncDate}</div>
          <Accordion preExpanded={['0']}>
            {syncIds.map((id, index) => {
              return (
                <AccordionItem uuid={String(index)}>
                  <AccordionItemHeading>
                    <AccordionItemButton>
                      {moment
                        .utc(
                          summarySyncHistories.filter(
                            (p) => p.Product.classification == classification && p.syncId == id,
                          )[0].createdAt,
                        )
                        .format('MMMM Do YYYY, h:mm a')}
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <ReactTable
                      data={summarySyncHistories.filter(
                        (p) => p.Product.classification == classification && p.syncId == id,
                      )}
                      columns={tableColumns}
                      resizable={false}
                      minRows={1}
                      showPagination={false}
                    />
                  </AccordionItemPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    summarySyncHistories: state.summarySyncHistoryReducer.data,
  };
};
const mapDispatchToProps = (dispatch) => bindActionCreators({ summarySyncHistoryList }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SummarySyncHistory);
