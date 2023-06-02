import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { withStyles } from '@material-ui/core';
import { uniq } from 'lodash/array';
import { deliveryListStyles } from './deliveryList.styles';
import PropTypes from 'prop-types';
import { getDeliveryLotsQty, getDeliveryLotsQtyReturn } from '../../../utilities/product';
//import PlaylistAdd from "@material-ui/icons/PlaylistAdd";
import Tooltip from '@material-ui/core/Tooltip';
import axios from 'axios';
import { flatten } from 'lodash';

class DeliveryLotsAndDetailsCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteIcon: false,
      newDeliveryReceiptDetails: [
        {
          lotId: 0,
          quantity: 0,
        },
      ],
    };
  }
  componentDidMount = () => {
    if (this.props.isEdit) {
      const deliveryReceiptsDetails = this.props.deliveryReceiptsDetails.filter(
        (item) =>
          item.deliveryReceiptId === this.props.deliveryReceiptId &&
          item.customerMonsantoProductId === this.props.customerMonsantoProductId,
      );

      const data = [];
      deliveryReceiptsDetails.map((item) => {
        const { MonsantoLot, Lot, CustomLot } = item;
        data.push({
          deliveryDetailId: item.id,
          lotId:
            MonsantoLot !== null ? MonsantoLot.id : Lot !== null ? Lot.id : CustomLot !== null ? CustomLot.id : '-',
          quantity: parseFloat(item.amountDelivered) || 0,
        });
      });

      this.setState({
        newDeliveryReceiptDetails:
          data.length > 0
            ? data
            : [
                {
                  lotId: 0,
                  quantity: 0,
                },
              ],
      });
    }
  };

  addDefaultItem = () => {
    const { lots } = this.props;
    const newItem = {
      lotId: 0,
      quantity: 0,
    };
    this.setState({
      newDeliveryReceiptDetails: [...this.state.newDeliveryReceiptDetails, newItem],
    });
  };

  removeDeliveryListItem = (index) => (_) => {
    const { newDeliveryReceiptDetails } = this.state;
    this.setState({
      newDeliveryReceiptDetails: this.state.newDeliveryReceiptDetails.filter(
        (item) => item !== newDeliveryReceiptDetails[index],
      ),
    });
  };

  handleInputChange = (index, attribute, rawValue) => (e) => {
    const value = rawValue ? e : e.target.value;
    const { newDeliveryReceiptDetails } = this.state;
    const prevItem = newDeliveryReceiptDetails[index];

    if (prevItem[attribute] !== value) {
      const newItem = { ...prevItem };
      newItem[attribute] = value;
      const newDeliveryReceiptDetails = [...this.state.newDeliveryReceiptDetails];
      const itemIndex = newDeliveryReceiptDetails.findIndex((item) => item === prevItem);
      newDeliveryReceiptDetails[itemIndex] = newItem;

      this.setState({ newDeliveryReceiptDetails });
    }

    parseFloat(value) == this.props.remainQty
      ? this.props.setErrorMessage('Update the quantity of your ordered first')
      : this.props.setErrorMessage('');

    attribute === 'quantity' &&
      this.props.setFillAllData(parseFloat(value) !== 0 && parseFloat(value) <= this.props.remainQty ? false : true);
  };

  getWarehouseQuantity = (lot) => {
    const { deliveryReceiptsAll } = this.props;
    const DeliveryReceiptDetailsAll = flatten(deliveryReceiptsAll.map((dr) => dr.DeliveryReceiptDetails));

    let totalQuantity = 0,
      deliveryQtyisReturn = 0,
      deliveryQty = 0;
    this.props.lots
      .filter((item) => item.lotNumber === lot.lotNumber)
      .map((l) => {
        if (l.source === 'Transfer Out' || l.source === 'Seed Dealer Transfer Out' || l.source == null) {
          totalQuantity = Number(totalQuantity) - Number(l.quantity);
        } else if (l.source === 'Transfer In' || l.source === 'Seed Dealer Transfer In') {
          totalQuantity = Number(totalQuantity) + Number(l.quantity);
        } else {
          totalQuantity = Number(totalQuantity) + Number(l.quantity);
        }

        const quatityID = DeliveryReceiptDetailsAll.filter((data) => data.monsantoLotId === l.id);
        deliveryQtyisReturn = Number(deliveryQtyisReturn + getDeliveryLotsQtyReturn(quatityID, deliveryReceiptsAll));
        deliveryQty = Number(deliveryQty + getDeliveryLotsQty(quatityID, deliveryReceiptsAll));
      });
    return totalQuantity - deliveryQty + deliveryQtyisReturn;
  };

  getSeedSizeAndPackagingName = (lot) => {
    const seedSize = this.props.seedSizes.find((ss) => ss.id === lot.seedSizeId);
    const packaging = this.props.packagings.find((p) => p.id === lot.packagingId);
    return `${seedSize ? seedSize.name : ''} ${packaging ? packaging.name : ''}`;
  };

  get totalBagsCount() {
    return this.state.newDeliveryReceiptDetails.reduce((acc, item) => {
      const quantity = item.amountDelivered ? item.amountDelivered : item.quantity;

      return acc + Number(quantity || 0, 10);
    }, 0);
  }

  get isFullFilled() {
    return this.props.quantityRemaining <= this.totalBagsCount || this.props.quantityRemaining <= 0;
  }

  fillRemainingQuantity = (index) => (_) => {
    const { quantityRemaining } = this.props;
    const { newDeliveryReceiptDetails } = this.state;

    const currentItemQuantity = newDeliveryReceiptDetails[index].quantity;
    let quantity = parseInt(quantityRemaining, 10) - (this.totalBagsCount - currentItemQuantity);
    if (quantity > 0 && quantity > currentItemQuantity) {
      this.handleInputChange(index, 'quantity', true)(quantity);
    }
  };

  componentDidUpdate() {
    const { newDeliveryReceiptDetails } = this.state;

    this.props.setallDeliveryReceiptDetails(newDeliveryReceiptDetails);
  }
  render() {
    const { classes, isEdit, lots, deliveryReceiptId, remainQty, productName } = this.props;
    const { newDeliveryReceiptDetails, showDeleteIcon } = this.state;
    const output =
      lots &&
      lots.reduce((accumulator, cur) => {
        let date = cur.lotNumber;
        let found = accumulator.find((elem) => elem.lotNumber === date);
        if (found) {
          parseInt(found.quantity) + parseInt(cur.quantity);
        } else {
          accumulator.push(cur);
        }
        return accumulator;
      }, []);

    return (
      <React.Fragment>
        {newDeliveryReceiptDetails &&
          newDeliveryReceiptDetails.map((item, index) => {
            const lotId = item.lotId;

            const quantity = item.quantity && item.quantity;

            return (
              <div
                className={classes.detailRow}
                key={`${lotId}-${index}`}
                onMouseEnter={() => this.setState({ showDeleteIcon: true })}
                onMouseLeave={() => this.setState({ showDeleteIcon: false })}
              >
                <div>
                  <FormControl className={classes.lotsFormControl}>
                    <InputLabel htmlFor={`lot-numbers-${lotId}-${index}`}>Lot#</InputLabel>

                    <Select
                      id="selectLot"
                      className={classes.select}
                      value={lotId}
                      onChange={this.handleInputChange(index, 'lotId')}
                      input={<Input name="lots" id={`lot-numbers-${lotId}-${index}`} />}
                    >
                      {output.map((lot) => {
                        return (
                          <MenuItem key={lot.id} value={lot.id} id={lot.lotNumber}>
                            {`${lot.lotNumber !== null ? lot.lotNumber : '#'} ${this.getSeedSizeAndPackagingName(
                              lot,
                            )} (${this.getWarehouseQuantity(lot)} Units)`}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <FormControl className={classes.fillQuantityFormControl}>
                    <TextField
                      className={classes.fillQuantityInput}
                      type="number"
                      label="Qty (Units)"
                      value={quantity === 0 ? '' : quantity}
                      id={`fill-quantity-${
                        this.props.currentProduct.hasOwnProperty('monsantoProductId')
                          ? 'bayer'
                          : this.props.currentProduct.hasOwnProperty('productId')
                          ? 'seed'
                          : 'regular'
                      }`}
                      onChange={this.handleInputChange(index, 'quantity')}
                      inputProps={{ step: 0.1, min: 0, max: remainQty }}
                    />
                    {!this.isFullFilled && (
                      <Tooltip title="Fills the total quantity available in the lot">
                        <a onClick={this.fillRemainingQuantity(index)} className={classes.fillQtyBtn}>
                          Fill
                        </a>
                      </Tooltip>
                    )}
                  </FormControl>
                </div>
                {newDeliveryReceiptDetails.length > 1 && !item.deliveryDetailId && showDeleteIcon && (
                  <div>
                    <DeleteIcon
                      className={classes.removeDetailRowButton}
                      color="primary"
                      onClick={this.removeDeliveryListItem(index)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        {this.props.lots.length > 1 && (
          <a onClick={this.addDefaultItem} className={classes.addDetailRowButton}>
            Addtional Lot
          </a>
        )}
        <p className={classes.totalBagsText}>
          Total Bags <strong>{this.totalBagsCount}</strong>
        </p>
      </React.Fragment>
    );
  }
}

DeliveryLotsAndDetailsCell.propTypes = {
  lots: PropTypes.array,
  seedSizes: PropTypes.array,
  packagings: PropTypes.array,
  deliveryReceiptsDetails: PropTypes.array,
  quantityRemaining: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default withStyles(deliveryListStyles)(DeliveryLotsAndDetailsCell);
